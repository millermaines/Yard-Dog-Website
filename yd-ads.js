/* Yard Dog Landscapes — Google Ads conversion tracking + gclid capture.
 *
 * SAFE NO-OP until you fill in the four constants below from your Google Ads
 * account (Tools > Conversions). Until then this script only captures the gclid
 * so no ad data is lost — it fires nothing and loads no Google tag.
 *
 * After creating your conversion actions, paste:
 *   ADS_ID     = your account conversion ID  (looks like AW-1234567890)
 *   LABEL_LEAD = the "Request Form" conversion label
 *   LABEL_CALL = the "Phone Call Click" conversion label
 *   LABEL_MAIL = the "Email Click" conversion label   (optional)
 * then push the site. One file to edit.
 */
(function () {
  'use strict';

  /* ====== PASTE YOUR IDS HERE (see the PPC build sheet) =================== */
  var GA4_ID     = 'G-3WN8YFJRKC';        // GA4 Measurement ID — PRIMARY. Tracks Jobber form submits.
  var ADS_ID     = 'AW-XXXXXXXXXX';       // Google Ads conversion ID — OPTIONAL click-proxy backup.
  var LABEL_LEAD = 'XXXXXXXXXXXXXXXXXX';  // Google Ads "Request Form" click label (only if ADS_ID set)
  var LABEL_CALL = 'XXXXXXXXXXXXXXXXXX';  // Google Ads "Phone Call Click" label
  var LABEL_MAIL = 'XXXXXXXXXXXXXXXXXX';  // Google Ads "Email Click" label
  /* ======================================================================= */

  var ADS_ON = ADS_ID.indexOf('XXXX') === -1;
  var GA4_ON = GA4_ID.indexOf('XXXX') === -1;
  var CONFIGURED = ADS_ON; // gates the Google Ads click-proxy conversions only

  /* ---- 1. Capture the Google click id on landing, keep it 90 days -------- */
  function dec(s) { try { return decodeURIComponent(s); } catch (_) { return s; } }
  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
    return m ? dec(m[1]) : '';
  }
  function setCookie(k, v, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    var secure = location.protocol === 'https:' ? ';Secure' : '';
    document.cookie = k + '=' + encodeURIComponent(v) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax' + secure;
  }
  function getCookie(k) {
    var m = new RegExp('(?:^|; )' + k + '=([^;]*)').exec(document.cookie);
    return m ? dec(m[1]) : '';
  }
  var fresh = param('gclid') || param('wbraid') || param('gbraid');
  if (fresh) setCookie('yd_gclid', fresh, 90);
  var gclid = fresh || getCookie('yd_gclid');

  /* ---- 2. Google tag bootstrap (only once configured) ------------------- */
  if (ADS_ON || GA4_ON) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { dataLayer.push(arguments); };
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + (GA4_ON ? GA4_ID : ADS_ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    // GA4 with cross-domain linking so a paid click carries into the Jobber form's domain
    if (GA4_ON) gtag('config', GA4_ID, { linker: { domains: ['yarddoglandscapes.com', 'clienthub.getjobber.com'] } });
    if (ADS_ON) gtag('config', ADS_ID);
  }
  function fire(label) {
    if (CONFIGURED && label && label.indexOf('XXXX') === -1) {
      // beacon transport so the hit still sends when the click navigates away
      gtag('event', 'conversion', { send_to: ADS_ID + '/' + label, transport_type: 'beacon' });
    }
  }

  /* ---- 3. Carry the gclid onto contact links + the Jobber request link --- */
  /* NOTE: passing the gclid INTO the embedded Jobber iframe so it lands on the
   * submitted request (the true closed loop) is pending confirmation that
   * Jobber preserves the param — see the PPC build sheet. Until confirmed we
   * only decorate outbound anchors, which is harmless if Jobber ignores it. */
  function withGclid(url) {
    if (!gclid || !url || url.indexOf('gclid=') !== -1) return url;
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'gclid=' + encodeURIComponent(gclid);
  }
  function decorate() {
    if (!gclid) return;
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href') || '';
      if (/(^|\/)contact(\?|#|$)/.test(h) || h.indexOf('clienthub.getjobber.com') !== -1) {
        links[i].setAttribute('href', withGclid(h));
      }
    }
  }

  /* ---- 4. Fire conversions on high-intent clicks ------------------------ */
  function onClick(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (h.indexOf('tel:') === 0) fire(LABEL_CALL);
    else if (h.indexOf('mailto:') === 0) fire(LABEL_MAIL);
    else if (/(^|\/)contact(\?|#|$)/.test(h) || h.indexOf('#estimate') !== -1 || h.indexOf('clienthub.getjobber.com') !== -1) fire(LABEL_LEAD);
  }

  function init() {
    decorate();
    document.addEventListener('click', onClick, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
