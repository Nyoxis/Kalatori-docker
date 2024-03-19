<?php
/**
 * @since 1.5.0
 *
 * @property Ps_Dotpayment $module
 */
class Ps_DotpaymentPaymentModuleFrontController extends ModuleFrontController
{
    public $ssl = true;

    /**
     * @see FrontController::initContent()
     */
    public function initContent()
    {
        parent::initContent();

        $cart = $this->context->cart;
        if (!$this->module->checkCurrency($cart)) {
            Tools::redirect('index.php?controller=order');
        }

        $total = sprintf(
            $this->getTranslator()->trans('%1$s (tax incl.)', [], 'Modules.Dotpayment.Shop'),
            $this->context->getCurrentLocale()->formatPrice($cart->getOrderTotal(true, Cart::BOTH), $this->context->currency->iso_code)
        );

        $this->context->smarty->assign([
            'back_url' => $this->context->link->getPageLink('order', true, null, 'step=3'),
            'confirm_url' => $this->context->link->getModuleLink('ps_dotpayment', 'validation', [], true),
            'image_url' => $this->module->getPathUri() . 'ps_dotpayment.jpg',
            'cust_currency' => $cart->id_currency,
            'currencies' => $this->module->getCurrency((int) $cart->id_currency),
            'total' => $total,
            'this_path' => $this->module->getPathUri(),
            'this_path_ssl' => Tools::getShopDomainSsl(true, true) . __PS_BASE_URI__ . 'modules/' . $this->module->name . '/',
        ]);

        $this->setTemplate('payment_execution.tpl');
    }
}
