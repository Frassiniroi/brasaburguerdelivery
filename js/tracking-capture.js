/**
 * Captura UTM/click IDs + enriquecimento servidor → localStorage.tracking_data
 * (mesmo padrão de funil delivery usado no stack de rastreio).
 */
(async function () {
  function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  function getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  }

  let trackingData = {};
  try {
    trackingData = JSON.parse(localStorage.getItem("tracking_data")) || {};
  } catch (e) {
    trackingData = {};
  }

  const urlParams = new URLSearchParams(window.location.search);
  const params = [
    "src", "sck", "utm_source", "utm_campaign", "utm_medium", "utm_content",
    "utm_term", "gclid", "fbclid", "ttclid", "xcod", "gbraid", "wbraid", "msclkid",
  ];

  params.forEach(function (key) {
    const value = urlParams.get(key);
    if (value) trackingData[key] = value;
  });

  trackingData.url = window.location.href;
  trackingData.user_agent = navigator.userAgent;
  trackingData.language = navigator.language;
  trackingData.screen_width = screen.width;
  trackingData.screen_height = screen.height;
  trackingData.viewport_width = window.innerWidth;
  trackingData.viewport_height = window.innerHeight;
  trackingData.session_id = getOrCreateSessionId();
  trackingData.timestamp = new Date().toISOString();
  trackingData.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!localStorage.getItem("first_visit")) {
    trackingData.first_visit = new Date().toISOString();
    localStorage.setItem("first_visit", trackingData.first_visit);
  } else {
    trackingData.first_visit = localStorage.getItem("first_visit");
  }

  await new Promise(function (resolve) {
    setTimeout(resolve, 1000);
  });

  const fbp = getCookie("_fbp");
  const fbc = getCookie("_fbc");
  if (fbp) trackingData.fbp = fbp;
  if (fbc) trackingData.fbc = fbc;

  try {
    const response = await fetch("/get_tracking_data.php");
    const serverData = await response.json();
    if (serverData.ip) trackingData.ip = serverData.ip;
    if (serverData.referer) trackingData.referer = serverData.referer;
    if (serverData.user_agent && !trackingData.user_agent) {
      trackingData.user_agent = serverData.user_agent;
    }
  } catch (error) {
    /* silencioso — não bloqueia a página */
  }

  try {
    localStorage.setItem("tracking_data", JSON.stringify(trackingData));
  } catch (e) {
    /* quota / private mode */
  }
})();
