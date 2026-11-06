---
'@laioutr/app-battery-included': patch
---

Search finds products on storefronts whose language has no region. Battery Included indexes a collection under language and region (`de-DE`) and found nothing for the bare `de` a Laioutr language usually is; the app now completes it with the market's country. A new **Locale** setting (module option `locale`) names the locale outright when the collection was indexed under another one.
