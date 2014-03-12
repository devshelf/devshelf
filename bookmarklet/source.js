(function(w, d) {
    w.DS = w.DS || {};


		/*
    		"<style> 													\
    			.ds-helper_cnt { 										\
    				position: fixed; 									\
    				top: 30px; 											\
    				right: 30px;     									\
    				z-index: 99999; 									\
    				background: #fcfcfc; 								\
    				border: 1px darkgray solid; 						\
    				padding: 10px; 										\
    				font: 12px/1.2 Arial, sans-serif; 					\
    				text-align: left; 									\
    				border-radius: 5px; 								\
    			} 														\
    			.ds-helper_url_cnt { 									\
    				padding: 10px 0; 									\
    			} 														\
    			.ds-input { 											\
    				padding: .5em .6em !important; 						\
    				font-size: 13px !important; 						\
    				width: 200px !important; 							\
    				display: inline-block !important; 					\
    				border: 1px solid #ccc !important; 					\
    				box-shadow: inset 0 1px 3px #ddd !important; 		\
    				border-radius: 4px !important; 						\
    				font-family: Arial, sans-serif !important; 			\
					margin: 0 !important; 								\
					-webkit-box-sizing: content-box; !important;		\
					-moz-box-sizing: content-box; !important;			\
					box-sizing: content-box;	!important;				\
    			} 														\
    			.ds-helper_ac_cnt { 									\
    				padding: 5px 0 10px; 								\
    			} 														\
    			.ds-label { 											\
					display: block !important; 							\
					font-size: 14px !important; 						\
					color: #526066 !important; 							\
					margin-bottom: 3px !important; 						\
    				width: auto !important;								\
    			} 														\
    			.ds-helper_close { 										\
    				position: absolute; 								\
    				top: 2px; 											\
    				right: 9px; 										\
    				font-weight: 700; 									\
    				color: gray; 										\
    				font-size: 18px; 									\
    				font-family: Verdana, sans-serif; 					\
    				cursor: pointer 									\
    			} 														\
    			.ds-radio { 											\
    				display: inline !important; 						\
    				margin: 0 !important; 								\
    				padding: 0 !important; 								\
    				width: auto !important;								\
    			} 														\
    			.ds-helper_button { 									\
    				display: none;  									\
    				background-color: #0078e7 !important; 				\
    				color: #fff !important; 							\
    				padding: .5em 1.5em .5em !important; 				\
    				width: auto !important;								\
    				font-size: 16px !important; 						\
    				border-radius: 2px !important; 						\
    				border: 0 none !important; 							\
    				cursor: pointer !important; 						\
    			} 														\
    		</style> 													\
    		<div class = 'ds-helper_cnt'> \
                <div class='ds-helper_url_cnt'><label class='ds-label'>Article link</label> <input type='url' class='ds-helper_url ds-input' name='url'/></div> \
                <div class='ds-helper_ac_cnt'><label class='ds-label'><input class='ds-radio' type='radio' name='field' checked='checked' id='title' />&nbsp;Choose title by click:</label>  <input type='text' class='ds-helper_ac ds-input' name='title'/></div> \
                <div class='ds-helper_ac_cnt'><label class='ds-label'><input class='ds-radio' type='radio' name='field' id='author' />&nbsp;Choose author by click (opt):</label>  <input type='text' class='ds-helper_author ds-input' name='author' /></div> \
                <div class='ds-helper_submit'><button onclick='window.open(\"http://local.host:8888/?url=\" + window.DS.href + \"&title=\" + window.DS.title + \"&author=\" + window.DS.author, \"mywindow\",\"width=500,height=540\")' class='ds-helper_button'>Send</button></div> \
                <div class='ds-helper_close'>x</div> \
        	</div>";
		*/

    var bmTemplate = atob( "PHN0eWxlPiAJCQkJCQkJCQkJCQkJICAgIAkJCS5kcy1oZWxwZXJfY250IHsgCQkJCQkJCQkJCSAgICAJCQkJcG9zaXRpb246IGZpeGVkOyAJCQkJCQkJCQkgICAgCQkJCXRvcDogMzBweDsgCQkJCQkJCQkJCQkgICAgCQkJCXJpZ2h0OiAzMHB4OyAgICAgCQkJCQkJCQkJICAgIAkJCQl6LWluZGV4OiA5OTk5OTsgCQkJCQkJCQkJICAgIAkJCQliYWNrZ3JvdW5kOiAjZmNmY2ZjOyAJCQkJCQkJCSAgICAJCQkJYm9yZGVyOiAxcHggZGFya2dyYXkgc29saWQ7IAkJCQkJCSAgICAJCQkJcGFkZGluZzogMTBweDsgCQkJCQkJCQkJCSAgICAJCQkJZm9udDogMTJweC8xLjIgQXJpYWwsIHNhbnMtc2VyaWY7IAkJCQkJICAgIAkJCQl0ZXh0LWFsaWduOiBsZWZ0OyAJCQkJCQkJCQkgICAgCQkJCWJvcmRlci1yYWRpdXM6IDVweDsgCQkJCQkJCQkgICAgCQkJfSAJCQkJCQkJCQkJCQkJCSAgICAJCQkuZHMtaGVscGVyX3VybF9jbnQgeyAJCQkJCQkJCQkgICAgCQkJCXBhZGRpbmc6IDEwcHggMDsgCQkJCQkJCQkJICAgIAkJCX0gCQkJCQkJCQkJCQkJCQkgICAgCQkJLmRzLWlucHV0IHsgCQkJCQkJCQkJCQkgICAgCQkJCXBhZGRpbmc6IC41ZW0gLjZlbSAhaW1wb3J0YW50OyAJCQkJCQkgICAgCQkJCWZvbnQtc2l6ZTogMTNweCAhaW1wb3J0YW50OyAJCQkJCQkgICAgCQkJCXdpZHRoOiAyMDBweCAhaW1wb3J0YW50OyAJCQkJCQkJICAgIAkJCQlkaXNwbGF5OiBpbmxpbmUtYmxvY2sgIWltcG9ydGFudDsgCQkJCQkgICAgCQkJCWJvcmRlcjogMXB4IHNvbGlkICNjY2MgIWltcG9ydGFudDsgCQkJCQkgICAgCQkJCWJveC1zaGFkb3c6IGluc2V0IDAgMXB4IDNweCAjZGRkICFpbXBvcnRhbnQ7IAkJICAgIAkJCQlib3JkZXItcmFkaXVzOiA0cHggIWltcG9ydGFudDsgCQkJCQkJICAgIAkJCQlmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWYgIWltcG9ydGFudDsgCQkJCQkJCQltYXJnaW46IDAgIWltcG9ydGFudDsgCQkJCQkJCQkJCQkJCS13ZWJraXQtYm94LXNpemluZzogY29udGVudC1ib3g7ICFpbXBvcnRhbnQ7CQkJCQkJCS1tb3otYm94LXNpemluZzogY29udGVudC1ib3g7ICFpbXBvcnRhbnQ7CQkJCQkJCQlib3gtc2l6aW5nOiBjb250ZW50LWJveDsJIWltcG9ydGFudDsJCQkJICAgIAkJCX0gCQkJCQkJCQkJCQkJCQkgICAgCQkJLmRzLWhlbHBlcl9hY19jbnQgeyAJCQkJCQkJCQkgICAgCQkJCXBhZGRpbmc6IDVweCAwIDEwcHg7IAkJCQkJCQkJICAgIAkJCX0gCQkJCQkJCQkJCQkJCQkgICAgCQkJLmRzLWxhYmVsIHsgCQkJCQkJCQkJCQkJCQkJCWRpc3BsYXk6IGJsb2NrICFpbXBvcnRhbnQ7IAkJCQkJCQkJCQkJCWZvbnQtc2l6ZTogMTRweCAhaW1wb3J0YW50OyAJCQkJCQkJCQkJCWNvbG9yOiAjNTI2MDY2ICFpbXBvcnRhbnQ7IAkJCQkJCQkJCQkJCW1hcmdpbi1ib3R0b206IDNweCAhaW1wb3J0YW50OyAJCQkJCQkgICAgCQkJCXdpZHRoOiBhdXRvICFpbXBvcnRhbnQ7CQkJCQkJCQkgICAgCQkJfSAJCQkJCQkJCQkJCQkJCSAgICAJCQkuZHMtaGVscGVyX2Nsb3NlIHsgCQkJCQkJCQkJCSAgICAJCQkJcG9zaXRpb246IGFic29sdXRlOyAJCQkJCQkJCSAgICAJCQkJdG9wOiAycHg7IAkJCQkJCQkJCQkJICAgIAkJCQlyaWdodDogOXB4OyAJCQkJCQkJCQkJICAgIAkJCQlmb250LXdlaWdodDogNzAwOyAJCQkJCQkJCQkgICAgCQkJCWNvbG9yOiBncmF5OyAJCQkJCQkJCQkJICAgIAkJCQlmb250LXNpemU6IDE4cHg7IAkJCQkJCQkJCSAgICAJCQkJZm9udC1mYW1pbHk6IFZlcmRhbmEsIHNhbnMtc2VyaWY7IAkJCQkJICAgIAkJCQljdXJzb3I6IHBvaW50ZXIgCQkJCQkJCQkJICAgIAkJCX0gCQkJCQkJCQkJCQkJCQkgICAgCQkJLmRzLXJhZGlvIHsgCQkJCQkJCQkJCQkgICAgCQkJCWRpc3BsYXk6IGlubGluZSAhaW1wb3J0YW50OyAJCQkJCQkgICAgCQkJCW1hcmdpbjogMCAhaW1wb3J0YW50OyAJCQkJCQkJCSAgICAJCQkJcGFkZGluZzogMCAhaW1wb3J0YW50OyAJCQkJCQkJCSAgICAJCQkJd2lkdGg6IGF1dG8gIWltcG9ydGFudDsJCQkJCQkJCSAgICAJCQl9IAkJCQkJCQkJCQkJCQkJICAgIAkJCS5kcy1oZWxwZXJfYnV0dG9uIHsgCQkJCQkJCQkJICAgIAkJCQlkaXNwbGF5OiBub25lOyAgCQkJCQkJCQkJICAgIAkJCQliYWNrZ3JvdW5kLWNvbG9yOiAjMDA3OGU3ICFpbXBvcnRhbnQ7IAkJCQkgICAgCQkJCWNvbG9yOiAjZmZmICFpbXBvcnRhbnQ7IAkJCQkJCQkgICAgCQkJCXBhZGRpbmc6IC41ZW0gMS41ZW0gLjVlbSAhaW1wb3J0YW50OyAJCQkJICAgIAkJCQl3aWR0aDogYXV0byAhaW1wb3J0YW50OwkJCQkJCQkJICAgIAkJCQlmb250LXNpemU6IDE2cHggIWltcG9ydGFudDsgCQkJCQkJICAgIAkJCQlib3JkZXItcmFkaXVzOiAycHggIWltcG9ydGFudDsgCQkJCQkJICAgIAkJCQlib3JkZXI6IDAgbm9uZSAhaW1wb3J0YW50OyAJCQkJCQkJICAgIAkJCQljdXJzb3I6IHBvaW50ZXIgIWltcG9ydGFudDsgCQkJCQkJICAgIAkJCX0gCQkJCQkJCQkJCQkJCQkgICAgCQk8L3N0eWxlPiAJCQkJCQkJCQkJCQkJICAgIAkJPGRpdiBjbGFzcyA9ICdkcy1oZWxwZXJfY250Jz4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9J2RzLWhlbHBlcl91cmxfY250Jz48bGFiZWwgY2xhc3M9J2RzLWxhYmVsJz5BcnRpY2xlIGxpbms8L2xhYmVsPiA8aW5wdXQgdHlwZT0ndXJsJyBjbGFzcz0nZHMtaGVscGVyX3VybCBkcy1pbnB1dCcgbmFtZT0ndXJsJy8+PC9kaXY+ICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdkcy1oZWxwZXJfYWNfY250Jz48bGFiZWwgY2xhc3M9J2RzLWxhYmVsJz48aW5wdXQgY2xhc3M9J2RzLXJhZGlvJyB0eXBlPSdyYWRpbycgbmFtZT0nZmllbGQnIGNoZWNrZWQ9J2NoZWNrZWQnIGlkPSd0aXRsZScgLz4mbmJzcDtDaG9vc2UgdGl0bGUgYnkgY2xpY2s6PC9sYWJlbD4gIDxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzcz0nZHMtaGVscGVyX2FjIGRzLWlucHV0JyBuYW1lPSd0aXRsZScvPjwvZGl2PiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nZHMtaGVscGVyX2FjX2NudCc+PGxhYmVsIGNsYXNzPSdkcy1sYWJlbCc+PGlucHV0IGNsYXNzPSdkcy1yYWRpbycgdHlwZT0ncmFkaW8nIG5hbWU9J2ZpZWxkJyBpZD0nYXV0aG9yJyAvPiZuYnNwO0Nob29zZSBhdXRob3IgYnkgY2xpY2sgKG9wdCk6PC9sYWJlbD4gIDxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzcz0nZHMtaGVscGVyX2F1dGhvciBkcy1pbnB1dCcgbmFtZT0nYXV0aG9yJyAvPjwvZGl2PiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nZHMtaGVscGVyX3N1Ym1pdCc+PGJ1dHRvbiBvbmNsaWNrPSd3aW5kb3cub3BlbigiaHR0cDovL2xvY2FsLmhvc3Q6ODg4OC8/dXJsPSIgKyB3aW5kb3cuRFMuaHJlZiArICImdGl0bGU9IiArIHdpbmRvdy5EUy50aXRsZSArICImYXV0aG9yPSIgKyB3aW5kb3cuRFMuYXV0aG9yLCAibXl3aW5kb3ciLCJ3aWR0aD01MDAsaGVpZ2h0PTU0MCIpJyBjbGFzcz0nZHMtaGVscGVyX2J1dHRvbic+U2VuZDwvYnV0dG9uPjwvZGl2PiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nZHMtaGVscGVyX2Nsb3NlJz54PC9kaXY+ICAgICAgICAgCTwvZGl2Pg==" );

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