/* Yard Dog Landscapes — gclid capture + optional Google Ads click-proxy conversions.
 *
 * GA4 itself is the standard <script> Google tag in each page's <head>
 * (Measurement ID G-3WN8YFJRKC); it tracks the Jobber form submit via GA4
 * cross-domain measurement. THIS file is a supplement that:
 *   - captures the gclid on paid landing (90-day cookie) for later attribution,
 *   - decorates outbound contact / Jobber-form links with the gclid,
 *   - (only once the Google Ads constants below are filled in) fires Google Ads
 *     click-proxy conversions on tel / mailto / request-form clicks.
 * It reuses the gtag already loaded by the GA4 tag — it does NOT load gtag itself.
 * Safe no-op for ads until configured; gclid capture always runs.
 */
(function () {
  'use strict';

  /* ==== OPTIONAL: Google Ads click-proxy (GA4 handles the primary tracking) ==== */
  var ADS_ID     = 'AW-XXXXXXXXXX';
  var LABEL_LEAD = 'XXXXXXXXXXXXXXXXXX';
  var LABEL_CALL = 'XXXXXXXXXXXXXXXXXX';
  var LABEL_MAIL = 'XXXXXXXXXXXXXXXXXX';
  /* ============================================================================ */

  var ADS_ON = ADS_ID.indexOf('XXXX') === -1;

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

  // Reuse the gtag loaded by the GA4 tag in <head>; only add the Google Ads config.
  if (ADS_ON && window.gtag) window.gtag('config', ADS_ID);
  function fire(label) {
    if (ADS_ON && window.gtag && label && label.indexOf('XXXX') === -1) {
      window.gtag('event', 'conversion', { send_to: ADS_ID + '/' + label, transport_type: 'beacon' });
    }
  }

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
