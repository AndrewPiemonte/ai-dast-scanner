export let resData = {
    "ai_analysis": "In the ZAP security scan report, several vulnerabilities have been identified:\n\n1. Content Security Policy (CSP) Header Not Set: The website lacks a Content Security Policy, increasing the risk of Cross-Site Scripting (XSS) and data injection attacks. To mitigate this, implement a CSP header on the web server, application server, or load balancer.\n\n2. Cookie with SameSite Attribute None (Low-Medium risk): Cookies",
    "scan_results": {
        "@programName": "ZAP",
        "@version": "2.15.0",
        "@generated": "Thurs, 5 Dec 2024 05:55:51",
        "site": [
            {
                "@name": "https://www.harvard.com",
                "@host": "www.harvard.com",
                "@port": "443",
                "@ssl": "true",
                "alerts": [
                    {
                        "pluginid": "10038",
                        "alertRef": "10038-1",
                        "alert": "Content Security Policy (CSP) Header Not Set",
                        "name": "Content Security Policy (CSP) Header Not Set",
                        "riskcode": "2",
                        "confidence": "3",
                        "riskdesc": "Medium (High)",
                        "desc": "<p>Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/CHANGELOG.txt",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/includes/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/install.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/misc/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/modules/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/profiles/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/scripts/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/themes/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/xmlrpc.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            }
                        ],
                        "count": "11",
                        "solution": "<p>Ensure that your web server, application server, load balancer, etc. is configured to set the Content-Security-Policy header.</p>",
                        "otherinfo": "",
                        "reference": "<p>https://developer.mozilla.org/en-US/docs/Web/Security/CSP/Introducing_Content_Security_Policy</p><p>https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html</p><p>https://www.w3.org/TR/CSP/</p><p>https://w3c.github.io/webappsec-csp/</p><p>https://web.dev/articles/csp</p><p>https://caniuse.com/#feat=contentsecuritypolicy</p><p>https://content-security-policy.com/</p>",
                        "cweid": "693",
                        "wascid": "15",
                        "sourceid": "1"
                    },
                    {
                        "pluginid": "10020",
                        "alertRef": "10020-1",
                        "alert": "Missing Anti-clickjacking Header",
                        "name": "Missing Anti-clickjacking Header",
                        "riskcode": "2",
                        "confidence": "2",
                        "riskdesc": "Medium (Medium)",
                        "desc": "<p>The response does not protect against 'ClickJacking' attacks. It should include either Content-Security-Policy with 'frame-ancestors' directive or X-Frame-Options.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/install.php",
                                "method": "GET",
                                "param": "x-frame-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            }
                        ],
                        "count": "1",
                        "solution": "<p>Modern Web browsers support the Content-Security-Policy and X-Frame-Options HTTP headers. Ensure one of them is set on all web pages returned by your site/app.</p><p>If you expect the page to be framed only by pages on your server (e.g. it's part of a FRAMESET) then you'll want to use SAMEORIGIN, otherwise if you never expect the page to be framed, you should use DENY. Alternatively consider implementing Content Security Policy's \"frame-ancestors\" directive.</p>",
                        "otherinfo": "",
                        "reference": "<p>https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options</p>",
                        "cweid": "1021",
                        "wascid": "15",
                        "sourceid": "472"
                    },
                    {
                        "pluginid": "10099",
                        "alertRef": "10099",
                        "alert": "Source Code Disclosure - SQL",
                        "name": "Source Code Disclosure - SQL",
                        "riskcode": "2",
                        "confidence": "2",
                        "riskdesc": "Medium (Medium)",
                        "desc": "<p>Application Source Code was disclosed by the web server. - SQL</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/INSTALL.pgsql.txt",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "CREATE DATABASE USER",
                                "otherinfo": ""
                            }
                        ],
                        "count": "1",
                        "solution": "<p>Ensure that application Source Code is not available with alternative extensions, and ensure that source code is not present within other files or data deployed to the web server, or served by the web server.</p>",
                        "otherinfo": "",
                        "reference": "<p>https://www.wsj.com/articles/BL-CIOB-2999</p>",
                        "cweid": "540",
                        "wascid": "13",
                        "sourceid": "357"
                    },
                    {
                        "pluginid": "90003",
                        "alertRef": "90003",
                        "alert": "Sub Resource Integrity Attribute Missing",
                        "name": "Sub Resource Integrity Attribute Missing",
                        "riskcode": "2",
                        "confidence": "3",
                        "riskdesc": "Medium (High)",
                        "desc": "<p>The integrity attribute is missing on a script or link tag served by an external server. The integrity tag prevents an attacker who have gained access to this server from injecting a malicious content.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<script src=\"https://kit.fontawesome.com/0ff5f8253a.js\" crossorigin=\"anonymous\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<script src=\"https://www.googletagmanager.com/gtag/js?id=G-B3YDHBHK16\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/?q=admin/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<script src=\"https://kit.fontawesome.com/0ff5f8253a.js\" crossorigin=\"anonymous\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/?q=admin/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<script src=\"https://www.googletagmanager.com/gtag/js?id=G-B3YDHBHK16\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/admin/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<script src=\"https://kit.fontawesome.com/0ff5f8253a.js\" crossorigin=\"anonymous\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/admin/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<script src=\"https://www.googletagmanager.com/gtag/js?id=G-B3YDHBHK16\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<script src=\"https://kit.fontawesome.com/0ff5f8253a.js\" crossorigin=\"anonymous\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<script src=\"https://www.googletagmanager.com/gtag/js?id=G-B3YDHBHK16\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/search/advanced_search",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<script src=\"https://kit.fontawesome.com/0ff5f8253a.js\" crossorigin=\"anonymous\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/search/advanced_search",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<script src=\"https://www.googletagmanager.com/gtag/js?id=G-B3YDHBHK16\"></script>",
                                "otherinfo": ""
                            }
                        ],
                        "count": "10",
                        "solution": "<p>Provide a valid integrity attribute to the tag.</p>",
                        "otherinfo": "",
                        "reference": "<p>https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity</p>",
                        "cweid": "345",
                        "wascid": "15",
                        "sourceid": "1"
                    },
                    {
                        "pluginid": "10003",
                        "alertRef": "10003",
                        "alert": "Vulnerable JS Library",
                        "name": "Vulnerable JS Library",
                        "riskcode": "2",
                        "confidence": "2",
                        "riskdesc": "Medium (Medium)",
                        "desc": "<p>The identified library jquery, version 1.4.4 is vulnerable.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/misc/jquery.js?v=1.4.4",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "* jQuery JavaScript Library v1.4.4",
                                "otherinfo": "CVE-2011-4969\nCVE-2020-11023\nCVE-2020-11022\nCVE-2015-9251\nCVE-2019-11358\nCVE-2020-7656\nCVE-2012-6708\n"
                            },
                            {
                                "uri": "https://www.harvard.com/misc/ui/jquery.ui.core.min.js?v=1.8.7",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "/*!\n * jQuery UI 1.8.7",
                                "otherinfo": "CVE-2021-41184\nCVE-2021-41183\nCVE-2021-41182\nCVE-2022-31160\n"
                            }
                        ],
                        "count": "2",
                        "solution": "<p>Please upgrade to the latest version of jquery.</p>",
                        "otherinfo": "<p>CVE-2011-4969</p><p>CVE-2020-11023</p><p>CVE-2020-11022</p><p>CVE-2015-9251</p><p>CVE-2019-11358</p><p>CVE-2020-7656</p><p>CVE-2012-6708</p><p></p>",
                        "reference": "<p>https://nvd.nist.gov/vuln/detail/CVE-2012-6708</p><p>https://github.com/jquery/jquery/issues/2432</p><p>http://research.insecurelabs.org/jquery/test/</p><p>https://nvd.nist.gov/vuln/detail/CVE-2019-11358</p><p>https://github.com/advisories/GHSA-rmxg-73gg-4p98</p><p>https://bugs.jquery.com/ticket/11974</p><p>https://github.com/jquery/jquery.com/issues/162</p><p>https://nvd.nist.gov/vuln/detail/CVE-2020-7656</p><p>https://bugs.jquery.com/ticket/9521</p><p>http://blog.jquery.com/2016/01/08/jquery-2-2-and-1-12-released/</p><p>http://bugs.jquery.com/ticket/11290</p><p>https://research.insecurelabs.org/jquery/test/</p><p>https://blog.jquery.com/2019/04/10/jquery-3-4-0-released/</p><p>https://nvd.nist.gov/vuln/detail/CVE-2015-9251</p><p>https://github.com/advisories/GHSA-q4m3-2j7h-f7xw</p><p>https://github.com/jquery/jquery/commit/753d591aea698e57d6db58c9f722cd0808619b1b</p><p>https://blog.jquery.com/2020/04/10/jquery-3-5-0-released/</p><p>https://nvd.nist.gov/vuln/detail/CVE-2011-4969</p><p></p>",
                        "cweid": "829",
                        "wascid": "-1",
                        "sourceid": "3705"
                    },
                    {
                        "pluginid": "10054",
                        "alertRef": "10054-2",
                        "alert": "Cookie with SameSite Attribute None",
                        "name": "Cookie with SameSite Attribute None",
                        "riskcode": "1",
                        "confidence": "2",
                        "riskdesc": "Low (Medium)",
                        "desc": "<p>A cookie has been set with its SameSite attribute set to \"none\", which means that the cookie can be sent as a result of a 'cross-site' request. The SameSite attribute is an effective counter measure to cross-site request forgery, cross-site script inclusion, and timing attacks.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/update.php",
                                "method": "GET",
                                "param": "SSESS2e1c76acdfb936f747e20606174727f3",
                                "attack": "",
                                "evidence": "set-cookie: SSESS2e1c76acdfb936f747e20606174727f3",
                                "otherinfo": ""
                            }
                        ],
                        "count": "1",
                        "solution": "<p>Ensure that the SameSite attribute is set to either 'lax' or ideally 'strict' for all cookies.</p>",
                        "otherinfo": "",
                        "reference": "<p>https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site</p>",
                        "cweid": "1275",
                        "wascid": "13",
                        "sourceid": "1196"
                    },
                    {
                        "pluginid": "10054",
                        "alertRef": "10054-1",
                        "alert": "Cookie without SameSite Attribute",
                        "name": "Cookie without SameSite Attribute",
                        "riskcode": "1",
                        "confidence": "2",
                        "riskdesc": "Low (Medium)",
                        "desc": "<p>A cookie has been set without the SameSite attribute, which means that the cookie can be sent as a result of a 'cross-site' request. The SameSite attribute is an effective counter measure to cross-site request forgery, cross-site script inclusion, and timing attacks.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "SERVERID",
                                "attack": "",
                                "evidence": "set-cookie: SERVERID",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/robots.txt",
                                "method": "GET",
                                "param": "SERVERID",
                                "attack": "",
                                "evidence": "set-cookie: SERVERID",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/sitemap.xml",
                                "method": "GET",
                                "param": "SERVERID",
                                "attack": "",
                                "evidence": "set-cookie: SERVERID",
                                "otherinfo": ""
                            }
                        ],
                        "count": "3",
                        "solution": "<p>Ensure that the SameSite attribute is set to either 'lax' or ideally 'strict' for all cookies.</p>",
                        "otherinfo": "",
                        "reference": "<p>https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site</p>",
                        "cweid": "1275",
                        "wascid": "13",
                        "sourceid": "1"
                    },
                    {
                        "pluginid": "10017",
                        "alertRef": "10017",
                        "alert": "Cross-Domain JavaScript Source File Inclusion",
                        "name": "Cross-Domain JavaScript Source File Inclusion",
                        "riskcode": "1",
                        "confidence": "2",
                        "riskdesc": "Low (Medium)",
                        "desc": "<p>The page includes one or more script files from a third-party domain.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "//a.mailmunch.co/app/v1/site.js",
                                "attack": "",
                                "evidence": "<script src=\"//a.mailmunch.co/app/v1/site.js\"\n      id=\"mailmunch-script\"\n      data-mailmunch-site-id=\"336656\"\n      async=\"async\">\n  </script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "//html5shiv.googlecode.com/svn/trunk/html5.js",
                                "attack": "",
                                "evidence": "<script src=\"//html5shiv.googlecode.com/svn/trunk/html5.js\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "https://kit.fontawesome.com/0ff5f8253a.js",
                                "attack": "",
                                "evidence": "<script src=\"https://kit.fontawesome.com/0ff5f8253a.js\" crossorigin=\"anonymous\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "https://www.googletagmanager.com/gtag/js?id=G-B3YDHBHK16",
                                "attack": "",
                                "evidence": "<script src=\"https://www.googletagmanager.com/gtag/js?id=G-B3YDHBHK16\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "//a.mailmunch.co/app/v1/site.js",
                                "attack": "",
                                "evidence": "<script src=\"//a.mailmunch.co/app/v1/site.js\"\n      id=\"mailmunch-script\"\n      data-mailmunch-site-id=\"336656\"\n      async=\"async\">\n  </script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "//html5shiv.googlecode.com/svn/trunk/html5.js",
                                "attack": "",
                                "evidence": "<script src=\"//html5shiv.googlecode.com/svn/trunk/html5.js\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "https://kit.fontawesome.com/0ff5f8253a.js",
                                "attack": "",
                                "evidence": "<script src=\"https://kit.fontawesome.com/0ff5f8253a.js\" crossorigin=\"anonymous\"></script>",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "https://www.googletagmanager.com/gtag/js?id=G-B3YDHBHK16",
                                "attack": "",
                                "evidence": "<script src=\"https://www.googletagmanager.com/gtag/js?id=G-B3YDHBHK16\"></script>",
                                "otherinfo": ""
                            }
                        ],
                        "count": "8",
                        "solution": "<p>Ensure JavaScript source files are loaded from only trusted sources, and the sources can't be controlled by end users of the application.</p>",
                        "otherinfo": "",
                        "reference": "",
                        "cweid": "829",
                        "wascid": "15",
                        "sourceid": "1"
                    },
                    {
                        "pluginid": "10063",
                        "alertRef": "10063-1",
                        "alert": "Permissions Policy Header Not Set",
                        "name": "Permissions Policy Header Not Set",
                        "riskcode": "1",
                        "confidence": "2",
                        "riskdesc": "Low (Medium)",
                        "desc": "<p>Permissions Policy Header is an added layer of security that helps to restrict from unauthorized access or usage of browser/client features by web resources. This policy ensures the user privacy by limiting or specifying the features of the browsers can be used by the web resources. Permissions Policy provides a set of standard HTTP headers that allow website owners to limit which features of browsers can be used by the page such as camera, microphone, location, full screen etc.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/CHANGELOG.txt",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/includes/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/install.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/misc/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/modules/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/profiles/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/scripts/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/themes/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/xmlrpc.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            }
                        ],
                        "count": "11",
                        "solution": "<p>Ensure that your web server, application server, load balancer, etc. is configured to set the Permissions-Policy header.</p>",
                        "otherinfo": "",
                        "reference": "<p>https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy</p><p>https://developer.chrome.com/blog/feature-policy/</p><p>https://scotthelme.co.uk/a-new-security-header-feature-policy/</p><p>https://w3c.github.io/webappsec-feature-policy/</p><p>https://www.smashingmagazine.com/2018/12/feature-policy/</p>",
                        "cweid": "693",
                        "wascid": "15",
                        "sourceid": "1"
                    },
                    {
                        "pluginid": "10037",
                        "alertRef": "10037",
                        "alert": "Server Leaks Information via \"X-Powered-By\" HTTP Response Header Field(s)",
                        "name": "Server Leaks Information via \"X-Powered-By\" HTTP Response Header Field(s)",
                        "riskcode": "1",
                        "confidence": "2",
                        "riskdesc": "Low (Medium)",
                        "desc": "<p>The web/application server is leaking information via one or more \"X-Powered-By\" HTTP response headers. Access to such information may facilitate attackers identifying other frameworks/components your web application is reliant upon and the vulnerabilities such components may be subject to.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/comment/reply/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/filter/tips/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/install.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/node/add/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/search/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/sitemap.xml",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/update.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/user/password/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/user/register/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "x-powered-by: PHP/5.5.9-1ubuntu4.29+esm15",
                                "otherinfo": ""
                            }
                        ],
                        "count": "11",
                        "solution": "<p>Ensure that your web server, application server, load balancer, etc. is configured to suppress \"X-Powered-By\" headers.</p>",
                        "otherinfo": "",
                        "reference": "<p>https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/08-Fingerprint_Web_Application_Framework</p><p>https://www.troyhunt.com/2012/02/shhh-dont-let-your-response-headers.html</p>",
                        "cweid": "200",
                        "wascid": "13",
                        "sourceid": "1"
                    },
                    {
                        "pluginid": "10096",
                        "alertRef": "10096",
                        "alert": "Timestamp Disclosure - Unix",
                        "name": "Timestamp Disclosure - Unix",
                        "riskcode": "1",
                        "confidence": "1",
                        "riskdesc": "Low (Low)",
                        "desc": "<p>A timestamp was disclosed by the application/web server. - Unix</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/book/9781580936590",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "1580936598",
                                "otherinfo": "1580936598, which evaluates to: 2020-02-05 21:03:18."
                            }
                        ],
                        "count": "1",
                        "solution": "<p>Manually confirm that the timestamp data is not sensitive, and that the data cannot be aggregated to disclose exploitable patterns.</p>",
                        "otherinfo": "<p>1580936598, which evaluates to: 2020-02-05 21:03:18.</p>",
                        "reference": "<p>https://cwe.mitre.org/data/definitions/200.html</p>",
                        "cweid": "200",
                        "wascid": "13",
                        "sourceid": "2053"
                    },
                    {
                        "pluginid": "10021",
                        "alertRef": "10021",
                        "alert": "X-Content-Type-Options Header Missing",
                        "name": "X-Content-Type-Options Header Missing",
                        "riskcode": "1",
                        "confidence": "2",
                        "riskdesc": "Low (Medium)",
                        "desc": "<p>The Anti-MIME-Sniffing header X-Content-Type-Options was not set to 'nosniff'. This allows older versions of Internet Explorer and Chrome to perform MIME-sniffing on the response body, potentially causing the response body to be interpreted and displayed as a content type other than the declared content type. Current (early 2014) and legacy versions of Firefox will use the declared content type (if one is set), rather than performing MIME-sniffing.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/INSTALL.mysql.txt",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/INSTALL.pgsql.txt",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/install.php",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/INSTALL.sqlite.txt",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/INSTALL.txt",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/LICENSE.txt",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/MAINTAINERS.txt",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/misc/jquery.js?v=1.4.4",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/robots.txt",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/sites/all/themes/contrib/flatland/css/ie8.css?smuo53",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/sites/harvard.com/files/favicon_0.ico",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            },
                            {
                                "uri": "https://www.harvard.com/UPGRADE.txt",
                                "method": "GET",
                                "param": "x-content-type-options",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.\nAt \"High\" threshold this scan rule will not alert on client or server error responses."
                            }
                        ],
                        "count": "12",
                        "solution": "<p>Ensure that the application/web server sets the Content-Type header appropriately, and that it sets the X-Content-Type-Options header to 'nosniff' for all web pages.</p><p>If possible, ensure that the end user uses a standards-compliant and modern web browser that does not perform MIME-sniffing at all, or that can be directed by the web application/web server to not perform MIME-sniffing.</p>",
                        "otherinfo": "<p>This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.</p><p>At \"High\" threshold this scan rule will not alert on client or server error responses.</p>",
                        "reference": "<p>https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85)</p><p>https://owasp.org/www-community/Security_Headers</p>",
                        "cweid": "693",
                        "wascid": "15",
                        "sourceid": "273"
                    },
                    {
                        "pluginid": "10027",
                        "alertRef": "10027",
                        "alert": "Information Disclosure - Suspicious Comments",
                        "name": "Information Disclosure - Suspicious Comments",
                        "riskcode": "0",
                        "confidence": "1",
                        "riskdesc": "Informational (Low)",
                        "desc": "<p>The response appears to contain suspicious comments which may help an attacker. Note: Matches made within script blocks or files are against the entire content not only comments.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "admin",
                                "otherinfo": "The following pattern was used: \\bADMIN\\b and was detected in the element starting with: \"<script>\n<!--//--><![CDATA[//><!--\njQuery.extend(Drupal.settings, {\"basePath\":\"\\/\",\"pathPrefix\":\"\",\"setHasJsCookie\":0,\"flatland\"\", see evidence field for the suspicious comment/snippet."
                            },
                            {
                                "uri": "https://www.harvard.com/?q=admin/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "admin",
                                "otherinfo": "The following pattern was used: \\bADMIN\\b and was detected in the element starting with: \"<script>\n<!--//--><![CDATA[//><!--\njQuery.extend(Drupal.settings, {\"basePath\":\"\\/\",\"pathPrefix\":\"\",\"setHasJsCookie\":0,\"ajaxPageS\", see evidence field for the suspicious comment/snippet."
                            },
                            {
                                "uri": "https://www.harvard.com/?q=admin/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "from",
                                "otherinfo": "The following pattern was used: \\bFROM\\b and was detected in the element starting with: \"<script>\n<!--//--><![CDATA[//><!--\nwindow.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments)};gtag(\"js\", see evidence field for the suspicious comment/snippet."
                            },
                            {
                                "uri": "https://www.harvard.com/admin/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "admin",
                                "otherinfo": "The following pattern was used: \\bADMIN\\b and was detected in the element starting with: \"<script>\n<!--//--><![CDATA[//><!--\njQuery.extend(Drupal.settings, {\"basePath\":\"\\/\",\"pathPrefix\":\"\",\"setHasJsCookie\":0,\"ajaxPageS\", see evidence field for the suspicious comment/snippet."
                            },
                            {
                                "uri": "https://www.harvard.com/admin/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "from",
                                "otherinfo": "The following pattern was used: \\bFROM\\b and was detected in the element starting with: \"<script>\n<!--//--><![CDATA[//><!--\nwindow.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments)};gtag(\"js\", see evidence field for the suspicious comment/snippet."
                            },
                            {
                                "uri": "https://www.harvard.com/browse/book",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "admin",
                                "otherinfo": "The following pattern was used: \\bADMIN\\b and was detected in the element starting with: \"<script>\n<!--//--><![CDATA[//><!--\njQuery.extend(Drupal.settings, {\"basePath\":\"\\/\",\"pathPrefix\":\"\",\"setHasJsCookie\":0,\"ajaxPageS\", see evidence field for the suspicious comment/snippet."
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "admin",
                                "otherinfo": "The following pattern was used: \\bADMIN\\b and was detected in the element starting with: \"<script>\n<!--//--><![CDATA[//><!--\njQuery.extend(Drupal.settings, {\"basePath\":\"\\/\",\"pathPrefix\":\"\",\"setHasJsCookie\":0,\"flatland\"\", see evidence field for the suspicious comment/snippet."
                            },
                            {
                                "uri": "https://www.harvard.com/cron.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "from",
                                "otherinfo": "The following pattern was used: \\bFROM\\b and was detected in the element starting with: \"<script>\n<!--//--><![CDATA[//><!--\nwindow.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments)};gtag(\"js\", see evidence field for the suspicious comment/snippet."
                            },
                            {
                                "uri": "https://www.harvard.com/search/advanced_search",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "admin",
                                "otherinfo": "The following pattern was used: \\bADMIN\\b and was detected in the element starting with: \"<script>\n<!--//--><![CDATA[//><!--\njQuery.extend(Drupal.settings, {\"basePath\":\"\\/\",\"pathPrefix\":\"\",\"setHasJsCookie\":0,\"ajaxPageS\", see evidence field for the suspicious comment/snippet."
                            },
                            {
                                "uri": "https://www.harvard.com/update.php",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "admin",
                                "otherinfo": "The following pattern was used: \\bADMIN\\b and was detected in the element starting with: \"<script type=\"text/javascript\">\n<!--//--><![CDATA[//><!--\njQuery.extend(Drupal.settings, {\"basePath\":\"\\/\",\"pathPrefix\":\"\",\"setHa\", see evidence field for the suspicious comment/snippet."
                            },
                            {
                                "uri": "https://www.harvard.com/user?destination=node",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "admin",
                                "otherinfo": "The following pattern was used: \\bADMIN\\b and was detected in the element starting with: \"<script>\n<!--//--><![CDATA[//><!--\njQuery.extend(Drupal.settings, {\"basePath\":\"\\/\",\"pathPrefix\":\"\",\"setHasJsCookie\":0,\"ajaxPageS\", see evidence field for the suspicious comment/snippet."
                            }
                        ],
                        "count": "11",
                        "solution": "<p>Remove all comments that return information that may help an attacker and fix any underlying problems they refer to.</p>",
                        "otherinfo": "<p>The following pattern was used: \\bADMIN\\b and was detected in the element starting with: \"<script></p><p><!--//--><![CDATA[//><!--</p><p>jQuery.extend(Drupal.settings, {\"basePath\":\"\\/\",\"pathPrefix\":\"\",\"setHasJsCookie\":0,\"flatland\"\", see evidence field for the suspicious comment/snippet.</p>",
                        "reference": "",
                        "cweid": "200",
                        "wascid": "13",
                        "sourceid": "1"
                    },
                    {
                        "pluginid": "10109",
                        "alertRef": "10109",
                        "alert": "Modern Web Application",
                        "name": "Modern Web Application",
                        "riskcode": "0",
                        "confidence": "2",
                        "riskdesc": "Informational (Medium)",
                        "desc": "<p>The application appears to be a modern web application. If you need to explore it automatically then the Ajax Spider may well be more effective than the standard one.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/user?destination=node",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "<noscript>\n  <style>form.antibot { display: none !important; }</style>\n  <div class=\"antibot-no-js antibot-message antibot-message-warning messages warning\">\n    You must have JavaScript enabled to use this form.  </div>\n</noscript>",
                                "otherinfo": "A noScript tag has been found, which is an indication that the application works differently with JavaScript enabled compared to when it is not."
                            }
                        ],
                        "count": "1",
                        "solution": "<p>This is an informational alert and so no changes are required.</p>",
                        "otherinfo": "<p>A noScript tag has been found, which is an indication that the application works differently with JavaScript enabled compared to when it is not.</p>",
                        "reference": "",
                        "cweid": "-1",
                        "wascid": "-1",
                        "sourceid": "1225"
                    },
                    {
                        "pluginid": "10049",
                        "alertRef": "10049",
                        "alert": "Non-Storable Content",
                        "name": "Non-Storable Content",
                        "riskcode": "0",
                        "confidence": "2",
                        "riskdesc": "Informational (Medium)",
                        "desc": "<p>The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "private",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/CHANGELOG.txt",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "403",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/includes/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "403",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/misc/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "403",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/modules/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "403",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/profiles/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "403",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/robots.txt",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "private",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/scripts/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "403",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/sitemap.xml",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "private",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/themes/",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "403",
                                "otherinfo": ""
                            }
                        ],
                        "count": "10",
                        "solution": "<p>The content may be marked as storable by ensuring that the following conditions are satisfied:</p><p>The request method must be understood by the cache and defined as being cacheable (\"GET\", \"HEAD\", and \"POST\" are currently defined as cacheable)</p><p>The response status code must be understood by the cache (one of the 1XX, 2XX, 3XX, 4XX, or 5XX response classes are generally understood)</p><p>The \"no-store\" cache directive must not appear in the request or response header fields</p><p>For caching by \"shared\" caches such as \"proxy\" caches, the \"private\" response directive must not appear in the response</p><p>For caching by \"shared\" caches such as \"proxy\" caches, the \"Authorization\" header field must not appear in the request, unless the response explicitly allows it (using one of the \"must-revalidate\", \"public\", or \"s-maxage\" Cache-Control response directives)</p><p>In addition to the conditions above, at least one of the following conditions must also be satisfied by the response:</p><p>It must contain an \"Expires\" header field</p><p>It must contain a \"max-age\" response directive</p><p>For \"shared\" caches such as \"proxy\" caches, it must contain a \"s-maxage\" response directive</p><p>It must contain a \"Cache Control Extension\" that allows it to be cached</p><p>It must have a status code that is defined as cacheable by default (200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501).</p>",
                        "otherinfo": "",
                        "reference": "<p>https://datatracker.ietf.org/doc/html/rfc7234</p><p>https://datatracker.ietf.org/doc/html/rfc7231</p><p>https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html</p>",
                        "cweid": "524",
                        "wascid": "13",
                        "sourceid": "1"
                    },
                    {
                        "pluginid": "10015",
                        "alertRef": "10015",
                        "alert": "Re-examine Cache-control Directives",
                        "name": "Re-examine Cache-control Directives",
                        "riskcode": "0",
                        "confidence": "1",
                        "riskdesc": "Informational (Low)",
                        "desc": "<p>The cache-control header has not been set properly or is missing, allowing the browser and proxies to cache content. For static assets like css, js, or image files this might be intended, however, the resources should be reviewed to ensure that no sensitive content will be cached.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "public, max-age=3600, private",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/INSTALL.mysql.txt",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/INSTALL.pgsql.txt",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/install.php",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/INSTALL.sqlite.txt",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/INSTALL.txt",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/LICENSE.txt",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/MAINTAINERS.txt",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/robots.txt",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "private",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/sitemap.xml",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "must-revalidate, private",
                                "otherinfo": ""
                            },
                            {
                                "uri": "https://www.harvard.com/UPGRADE.txt",
                                "method": "GET",
                                "param": "cache-control",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": ""
                            }
                        ],
                        "count": "11",
                        "solution": "<p>For secure content, ensure the cache-control HTTP header is set with \"no-cache, no-store, must-revalidate\". If an asset should be cached consider setting the directives \"public, max-age, immutable\".</p>",
                        "otherinfo": "",
                        "reference": "<p>https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching</p><p>https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control</p><p>https://grayduck.mn/2021/09/13/cache-control-recommendations/</p>",
                        "cweid": "525",
                        "wascid": "13",
                        "sourceid": "1"
                    },
                    {
                        "pluginid": "10112",
                        "alertRef": "10112",
                        "alert": "Session Management Response Identified",
                        "name": "Session Management Response Identified",
                        "riskcode": "0",
                        "confidence": "2",
                        "riskdesc": "Informational (Medium)",
                        "desc": "<p>The given response has been identified as containing a session management token. The 'Other Info' field contains a set of header tokens that can be used in the Header Based Session Management Method. If the request is in a context which has a Session Management Method set to \"Auto-Detect\" then this rule will change the session management to use the tokens identified.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/update.php",
                                "method": "GET",
                                "param": "SSESS2e1c76acdfb936f747e20606174727f3",
                                "attack": "",
                                "evidence": "n92VuONGFwXMMfTLmZO7vFvx0pOfDDfk9PbhOZXhVdA",
                                "otherinfo": "\ncookie:SSESS2e1c76acdfb936f747e20606174727f3"
                            }
                        ],
                        "count": "1",
                        "solution": "<p>This is an informational alert rather than a vulnerability and so there is nothing to fix.</p>",
                        "otherinfo": "<p></p><p>cookie:SSESS2e1c76acdfb936f747e20606174727f3</p>",
                        "reference": "<p>https://www.zaproxy.org/docs/desktop/addons/authentication-helper/session-mgmt-id</p>",
                        "cweid": "-1",
                        "wascid": "-1",
                        "sourceid": "1196"
                    },
                    {
                        "pluginid": "10049",
                        "alertRef": "10049",
                        "alert": "Storable and Cacheable Content",
                        "name": "Storable and Cacheable Content",
                        "riskcode": "0",
                        "confidence": "2",
                        "riskdesc": "Informational (Medium)",
                        "desc": "<p>The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where \"shared\" caching servers such as \"proxy\" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.</p>",
                        "instances": [
                            {
                                "uri": "https://www.harvard.com/INSTALL.mysql.txt",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234."
                            },
                            {
                                "uri": "https://www.harvard.com/INSTALL.pgsql.txt",
                                "method": "GET",
                                "param": "",
                                "attack": "",
                                "evidence": "",
                                "otherinfo": "In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234."
                            }
                        ],
                        "count": "2",
                        "solution": "<p>Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:</p><p>Cache-Control: no-cache, no-store, must-revalidate, private</p><p>Pragma: no-cache</p><p>Expires: 0</p><p>This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.</p>",
                        "otherinfo": "<p>In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.</p>",
                        "reference": "<p>https://datatracker.ietf.org/doc/html/rfc7234</p><p>https://datatracker.ietf.org/doc/html/rfc7231</p><p>https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html</p>",
                        "cweid": "524",
                        "wascid": "13",
                        "sourceid": "273"
                    }
                ]
            }
        ]
    },
    "metadata": {
        "timestamp": "20241201055017",
        "target_url": "https://www.harvard.com/"
    }
}