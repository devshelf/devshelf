(function(w, d) {
    w.DS = w.DS || {};

    /*
    	"<div class = 'ds-helper_cnt' style='text-align: left; position: fixed; background: #fcfcfc; top: 30px; right: 30px; border: 1px darkgray solid; padding: 10px; z-index: 99999; font: 12px/1.2 Arial, sans-serif; border-radius: 5px;'>" +
                "<div class='ds-helper_url_cnt' style='padding: 10px 0'><label style='display: block; font-size: 14px; color: #526066;'>Article link</label> <input type='url' class='ds-helper_url' name='url' style='padding: .5em .6em; font-size: 13px; width: 200px; display: inline-block; border: 1px solid #ccc; box-shadow: inset 0 1px 3px #ddd; border-radius: 4px;'/></div>" +
                "<div class='ds-helper_ac_cnt' style='padding: 5px 0 10px'><label style='display: block; font-size: 14px; color: #526066;'><input type='radio' name='field' checked='checked' id='title' />&nbsp;&nbsp;Choose title by click:</label>  <input type='text' class='ds-helper_ac' name='title' style='padding: .5em .6em; width: 200px; font-size: 13px; display: inline-block; border: 1px solid #ccc; box-shadow: inset 0 1px 3px #ddd; border-radius: 4px;'/></div>" +
                "<div class='ds-helper_ac_cnt' style='padding: 5px 0 10px'><label style='display: block; font-size: 14px; color: #526066;'><input type='radio' name='field' id='author' />&nbsp;&nbsp;Choose author by click (opt):</label>  <input type='text' class='ds-helper_author' name='author' style='padding: .5em .6em; width: 200px; font-size: 13px; display: inline-block; border: 1px solid #ccc; box-shadow: inset 0 1px 3px #ddd; border-radius: 4px;'/></div>" +
                "<div class='ds-helper_submit'><button onclick='window.open(\"http://local.host:8888/?url=\" + window.DS.href + \"&title=\" + window.DS.title + \"&author=\" + window.DS.author, \"mywindow\",\"width=500,height=540\")' class='ds-helper_button' style='display: none; background-color: #0078e7; color: #fff; padding: .5em 1.5em .5em; font-size: 16px; border-radius: 2px; border: 0 none; cursor: pointer'>Send</button></div>" +
                "<div class='ds-helper_close' style='position: absolute; top: 2px; right: 9px; font-weight: 700; color: gray; font-size: 18px; font-family: Verdana, sans-serif; cursor: pointer'>x</div>" +
        "</div>";
    */

    var bmTemplate = atob( "PGRpdiBjbGFzcyA9ICdkcy1oZWxwZXJfY250JyBzdHlsZT0ndGV4dC1hbGlnbjogbGVmdDsgcG9zaXRpb246IGZpeGVkOyBiYWNrZ3JvdW5kOiAjZmNmY2ZjOyB0b3A6IDMwcHg7IHJpZ2h0OiAzMHB4OyBib3JkZXI6IDFweCBkYXJrZ3JheSBzb2xpZDsgcGFkZGluZzogMTBweDsgei1pbmRleDogOTk5OTk7IGZvbnQ6IDEycHgvMS4yIEFyaWFsLCBzYW5zLXNlcmlmOyBib3JkZXItcmFkaXVzOiA1cHg7Jz48ZGl2IGNsYXNzPSdkcy1oZWxwZXJfdXJsX2NudCcgc3R5bGU9J3BhZGRpbmc6IDEwcHggMCc+PGxhYmVsIHN0eWxlPSdkaXNwbGF5OiBibG9jazsgZm9udC1zaXplOiAxNHB4OyBjb2xvcjogIzUyNjA2NjsnPkFydGljbGUgbGluazwvbGFiZWw+IDxpbnB1dCB0eXBlPSd1cmwnIGNsYXNzPSdkcy1oZWxwZXJfdXJsJyBuYW1lPSd1cmwnIHN0eWxlPSdwYWRkaW5nOiAuNWVtIC42ZW07IGZvbnQtc2l6ZTogMTNweDsgd2lkdGg6IDIwMHB4OyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGJvcmRlcjogMXB4IHNvbGlkICNjY2M7IGJveC1zaGFkb3c6IGluc2V0IDAgMXB4IDNweCAjZGRkOyBib3JkZXItcmFkaXVzOiA0cHg7Jy8+PC9kaXY+PGRpdiBjbGFzcz0nZHMtaGVscGVyX2FjX2NudCcgc3R5bGU9J3BhZGRpbmc6IDVweCAwIDEwcHgnPjxsYWJlbCBzdHlsZT0nZGlzcGxheTogYmxvY2s7IGZvbnQtc2l6ZTogMTRweDsgY29sb3I6ICM1MjYwNjY7Jz48aW5wdXQgdHlwZT0ncmFkaW8nIG5hbWU9J2ZpZWxkJyBjaGVja2VkPSdjaGVja2VkJyBpZD0ndGl0bGUnIC8+Jm5ic3A7Jm5ic3A7Q2hvb3NlIHRpdGxlIGJ5IGNsaWNrOjwvbGFiZWw+ICA8aW5wdXQgdHlwZT0ndGV4dCcgY2xhc3M9J2RzLWhlbHBlcl9hYycgbmFtZT0ndGl0bGUnIHN0eWxlPSdwYWRkaW5nOiAuNWVtIC42ZW07IHdpZHRoOiAyMDBweDsgZm9udC1zaXplOiAxM3B4OyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGJvcmRlcjogMXB4IHNvbGlkICNjY2M7IGJveC1zaGFkb3c6IGluc2V0IDAgMXB4IDNweCAjZGRkOyBib3JkZXItcmFkaXVzOiA0cHg7Jy8+PC9kaXY+PGRpdiBjbGFzcz0nZHMtaGVscGVyX2FjX2NudCcgc3R5bGU9J3BhZGRpbmc6IDVweCAwIDEwcHgnPjxsYWJlbCBzdHlsZT0nZGlzcGxheTogYmxvY2s7IGZvbnQtc2l6ZTogMTRweDsgY29sb3I6ICM1MjYwNjY7Jz48aW5wdXQgdHlwZT0ncmFkaW8nIG5hbWU9J2ZpZWxkJyBpZD0nYXV0aG9yJyAvPiZuYnNwOyZuYnNwO0Nob29zZSBhdXRob3IgYnkgY2xpY2sgKG9wdCk6PC9sYWJlbD4gIDxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzcz0nZHMtaGVscGVyX2F1dGhvcicgbmFtZT0nYXV0aG9yJyBzdHlsZT0ncGFkZGluZzogLjVlbSAuNmVtOyB3aWR0aDogMjAwcHg7IGZvbnQtc2l6ZTogMTNweDsgZGlzcGxheTogaW5saW5lLWJsb2NrOyBib3JkZXI6IDFweCBzb2xpZCAjY2NjOyBib3gtc2hhZG93OiBpbnNldCAwIDFweCAzcHggI2RkZDsgYm9yZGVyLXJhZGl1czogNHB4OycvPjwvZGl2PjxkaXYgY2xhc3M9J2RzLWhlbHBlcl9zdWJtaXQnPjxidXR0b24gb25jbGljaz0nd2luZG93Lm9wZW4oImh0dHA6Ly9sb2NhbC5ob3N0Ojg4ODgvP3VybD0iICsgd2luZG93LkRTLmhyZWYgKyAiJnRpdGxlPSIgKyB3aW5kb3cuRFMudGl0bGUgKyAiJmF1dGhvcj0iICsgd2luZG93LkRTLmF1dGhvciwgIm15d2luZG93Iiwid2lkdGg9NTAwLGhlaWdodD01NDAiKScgY2xhc3M9J2RzLWhlbHBlcl9idXR0b24nIHN0eWxlPSdkaXNwbGF5OiBub25lOyBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3OGU3OyBjb2xvcjogI2ZmZjsgcGFkZGluZzogLjVlbSAxLjVlbSAuNWVtOyBmb250LXNpemU6IDE2cHg7IGJvcmRlci1yYWRpdXM6IDJweDsgYm9yZGVyOiAwIG5vbmU7IGN1cnNvcjogcG9pbnRlcic+U2VuZDwvYnV0dG9uPjwvZGl2PjxkaXYgY2xhc3M9J2RzLWhlbHBlcl9jbG9zZScgc3R5bGU9J3Bvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAycHg7IHJpZ2h0OiA5cHg7IGZvbnQtd2VpZ2h0OiA3MDA7IGNvbG9yOiBncmF5OyBmb250LXNpemU6IDE4cHg7IGZvbnQtZmFtaWx5OiBWZXJkYW5hLCBzYW5zLXNlcmlmOyBjdXJzb3I6IHBvaW50ZXInPng8L2Rpdj48L2Rpdj4=" );

    var serviceDiv = d.createElement("div");

    // Adding html panel
    (w.DS.panel === undefined) && (function() {
        w.DS.panel = true;
        serviceDiv.className = "ds-helper";
        serviceDiv.innerHTML = bmTemplate;
        d.body.appendChild(serviceDiv);

        w.DS.href = window.location.href;

        d.querySelector(".ds-helper_url").value = w.DS.href;


        // Adding event listener
        (w.DS.listener === undefined) && (function() {
            w.DS.listener = true;

            serviceDiv.addEventListener("click", function(e) {
                e.stopPropagation();
            })

            d.querySelector(".ds-helper_close").addEventListener("click", function(e) {
				d.body.removeChild(serviceDiv);
				w.DS.panel = undefined;
                w.DS.listener = undefined;
                w.DS.title = "";
                w.DS.author = "";
            })

            w.addEventListener("click", function(e) {

                if (w.DS.listener) {
                    e.preventDefault();

					if (d.getElementById("title").checked) {
						w.DS.title = e.target.textContent;
						d.getElementById("author").checked = true;
	                    d.querySelector(".ds-helper_button").style.display = "block";
					} else {
						w.DS.author = e.target.textContent;
					}

                    d.querySelector(".ds-helper_ac").value = w.DS.title || "";
					d.querySelector(".ds-helper_author").value = w.DS.author || "";
                }
            })

            d.querySelector(".ds-helper_url").addEventListener("blur", function() {
                if (w.DS.listener) {
                    w.DS.href = d.querySelector(".ds-helper_url").value;
                }
            })

        })();

    })();

})(window, document);