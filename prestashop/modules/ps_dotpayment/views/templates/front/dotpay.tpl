<section>
    <div id='polkadot_work'><img src='{$module_host nofilter}/img/ajaxm.gif'> Loading plugin</div>

<!--
  <p>Select your DOT-account <span id='dotpay_wallet_finded'></span>

  <div class="form-group">
    <div id="WalletID_load" style='display:none'><img src='{$module_host nofilter}/img/ajaxm.gif'> <font color='green'>loading...</font></div>

    <div style='padding-left:30px;' id="WalletID" class="form-control">
	<label style='display:block;text-align:left;'><input style='margin-right: 5px;' name='dot_addr' type='radio' value='QR'>Manual</label>
	<div><input type='button' value='Open my Wallets' onclick='DOT.presta_start(this)'></div>
    </div>

  </div>

<div id='dotpay_info'></div>
<div id='dotpay_console'></div>
<div id='dotpay_console_test'></div>
-->

</section>


<script>
    var s=document.createElement('script');
    s.type='text/javascript';
    s.src="{$module_host nofilter}/js/DOT.js"
	    + '?random='+Math.random() // DEBUG ONLY!
    ;
    s.onerror=function(e){ alert('DOT plugin: script not found: '+e.src) };
    s.onload=function(e) {
	DOT.presta_init({
	    wpath:	 "{$module_host nofilter}",
	    ajax_host:	 "{$ajax_host nofilter}",
	    total:	 "{$total nofilter}",
	    module_name: "{$module_name nofilter}",
	    order_id:	 "{$order_id nofilter}",
	    shop_id:	 "{$shop_id nofilter}",
	    products:	 "{$products nofilter}",
	});
    };
    document.getElementsByTagName('head').item(0).appendChild(s);
</script>