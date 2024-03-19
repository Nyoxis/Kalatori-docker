<?php
/**
 * @since 1.5.0
 *
 * @property Ps_Dotpayment $module
 */
class Ps_DotpaymentAjaxModuleFrontController extends ModuleFrontController
{
    public $ssl = true;


    /**
     * @see FrontController::postProcess()
     */
  public function postProcess() {

    $cart = $this->context->cart;

    // Что нам известно внутри магазина
    $total = (float) ($cart->getOrderTotal(true, Cart::BOTH));
    $currency = $this->context->currency->iso_code;
    $order_id = (int) $cart->id;
    $customer = $cart->id_customer;

    // что нам прислали
    $input = (array)json_decode( file_get_contents("php://input") );
    if(empty($input) || empty($input['price']) || empty($input['order_id'])) {
	$ajax_order_id = $ajax_total = 0;
    } else {
	$ajax_order_id = $input['order_id'];
	$ajax_total = $input['price'];
    }

    if($order_id) {
	$order_present = 1;
	$json = array(
    	    'ajax_order_id' => $ajax_order_id,
	    'ajax_total' => $ajax_total,
	    'store_currency' => $currency,
	    'store_order_id' => $order_id,
	    'store_total' => $total,
	    'store_customer' => $customer
	);
    } else { // уже оплачен и корзина сброшена, делаем тогда проверку из наших данных
	$order_present = 0;
	// берем наши данные
	if( $ajax_order_id * $ajax_total == 0 ) $this->ejdie("Data error: order_id, total not found");
	$order_id = $ajax_order_id;
	$total = $ajax_total;
	$json = array(
	    'ajax_order_id' => $input['order_id'],
	    'ajax_total' => $input['total']
	);
    }

    // Defaults
    $name = Configuration::get('DOT_NAME'); if(empty($name)) $name='PrestaShop';
    $url = Configuration::get('DOT_URL'); if(empty($url)) $url='http://localhost:16726';
    $url.="/order/ps_".urlencode($name).'_'.$order_id."/price/".$total;

    if (   $cart->id_customer == 0
	|| $cart->id_address_delivery == 0
	|| $cart->id_address_invoice == 0
	|| !$this->module->active)
    {
	    $json['redirect'] = $this->context->link->getPageLink('order', true, null, 'step=1'); // '/index.php?controller=order&step=1';
	    $this->jdie($json);
    }

    // Check that this payment option is still available in case the customer changed his address just before the end of the checkout process
    $authorized = false;
    foreach (Module::getPaymentModules() as $module) {
        if ($module['name'] == 'ps_dotpayment') { $authorized = true; break; }
    } if (!$authorized) {
        $this->ejdie($this->module->getTranslator()->trans('This payment method is not available.', [], 'Modules.Dotpayment.Shop'));
    }

    $customer_obj = new Customer($customer);
    if (!Validate::isLoadedObject($customer_obj)) {
	$json['redirect'] = $this->context->link->getPageLink('order', true, null, 'step=1'); // '/index.php?controller=order&step=1';
	$this->jdie($json);
    }

    $mailVars = [ '{dot_daemon}' => Configuration::get('DOT_DAEMON') ];

    // $this->ejdie( $this->context->link->getModuleLink($this->module->name, 'validation', [], true) );

    // A J A X
    $r = $this->ajax($url);
    if(isset($r['error'])) $this->jdie($r);
    // Йобаные патчи для kalatori
    if(isset($r['order'])) $r['order_id']=$r['order'];
    $r['order_id']=preg_replace("/^.*\_/s",'',$r['order_id']);

    foreach($r as $n=>$l) $json[$n]=$l;

    // Log
    $this->logs(date("Y-m-d H:i:s")." [".$json['result']."] order:".$json['order_id']." price:".$json['price']." ".$r['pay_account']);

    // Success ?
    if(isset($r['result']) && strtolower($r['result'])=='paid') {
	// paid success
	if( $order_present ) {
	    // SUCCESS
	    $this->module->validateOrder(
		$order_id,
		(int) Configuration::get('PS_OS_PAYMENT'),
		$total,
		$this->module->displayName,
		null,
		$mailVars,
		(int) $this->context->currency->id,
		false,
		$customer_obj->secure_key
	    );
        }
        $json['redirect'] = $this->context->link->getModuleLink($this->module->name, 'validation', [], true);
	$this->jdie($json);
    }

    $this->jdie($json);
  }


  function ejdie($s) { $this->jdie(array('error'=>1,'error_message'=>$s)); }
  function jdie($j) { die(json_encode($j)); }

  function ajax($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, array(
        CURLOPT_HTTPHEADER => array('Content-Type:application/json'),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FAILONERROR => true,
        CURLOPT_CONNECTTIMEOUT => 2, // only spend 3 seconds trying to connect
        CURLOPT_TIMEOUT => 2 // 30 sec waiting for answer
    ));
    $r = curl_exec($ch);
    if(curl_errno($ch) || empty($r)) $this->ejdie("Daemon responce empty : ".curl_error($ch));
    $r = (array) json_decode($r);
    if(empty($r)) $this->ejdie("Daemon responce error parsing");
    curl_close($ch);
    return $r;
  }


  function logs($s='') {
    // $f = DIR_LOGS . "polkadot_log.log";
//    $f='/home/presta/log/payments.log';
//    $l=fopen($f,'a+');
//    fputs($l,$s."\n");
//    fclose($l);
//    chmod($f,0666);
  }

}
