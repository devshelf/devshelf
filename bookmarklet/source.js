(function(w, d) {
    w.DS = w.DS || {};

    var bmTemplate = "<div class = 'ds-helper_cnt' style='text-align: left; position: fixed; background: #fcfcfc; top: 30px; right: 30px; border: 1px darkgray solid; padding: 10px; z-index: 99999; font: 12px/1.2 Arial, sans-serif; border-radius: 5px;'>" +
                "<div class='ds-helper_url_cnt' style='padding: 10px 0'><label style='display: block; font-size: 14px; color: #526066;'>Article link</label> <input type='url' class='ds-helper_url' name='url' style='padding: .5em .6em; font-size: 13px; width: 200px; display: inline-block; border: 1px solid #ccc; box-shadow: inset 0 1px 3px #ddd; border-radius: 4px;'/></div>" +
                "<div class='ds-helper_ac_cnt' style='padding: 5px 0 10px'><label style='display: block; font-size: 14px; color: #526066;'><input type='radio' name='field' checked='checked' id='title' />&nbsp;&nbsp;Choose title by click:</label>  <input type='text' class='ds-helper_ac' name='title' style='padding: .5em .6em; width: 200px; font-size: 13px; display: inline-block; border: 1px solid #ccc; box-shadow: inset 0 1px 3px #ddd; border-radius: 4px;'/></div>" +
                "<div class='ds-helper_ac_cnt' style='padding: 5px 0 10px'><label style='display: block; font-size: 14px; color: #526066;'><input type='radio' name='field' id='author' />&nbsp;&nbsp;Choose author by click (opt):</label>  <input type='text' class='ds-helper_author' name='author' style='padding: .5em .6em; width: 200px; font-size: 13px; display: inline-block; border: 1px solid #ccc; box-shadow: inset 0 1px 3px #ddd; border-radius: 4px;'/></div>" +
                "<div class='ds-helper_submit'><button onclick='window.open(\"http://127.0.0.1:8888/?url=\" + window.DS.href + \"&title=\" + window.DS.title + \"&author=\" + window.DS.author, \"mywindow\",\"width=500,height=540\")' class='ds-helper_button' style='display: none; background-color: #0078e7; color: #fff; padding: .5em 1.5em .5em; font-size: 16px; border-radius: 2px; border: 0 none; cursor: pointer'>Send</button></div>" +
                "<div class='ds-helper_close' style='position: absolute; top: 2px; right: 9px; font-weight: 700; color: gray; font-size: 18px; font-family: Verdana, sans-serif; cursor: pointer'>x</div>" +
        "</div>";
    var serviceDiv = d.createElement("div");

    // Adding html panel
    (w.DS.panel === undefined) && (function() {
        w.DS.panel = true;
        serviceDiv.className = "ds-helper";
        serviceDiv.innerHTML = bmTemplate;
        d.body.appendChild(serviceDiv);

        w.DS.href = window.location.href;

        d.querySelector('.ds-helper_url').value = w.DS.href;


        // Adding event listener
        (w.DS.listener === undefined) && (function() {
            w.DS.listener = true;

            serviceDiv.addEventListener('click', function(e) {
                e.stopPropagation();
            })

            d.querySelector('.ds-helper_close').addEventListener('click', function(e) {
				d.body.removeChild(serviceDiv);
				w.DS.panel = undefined;
                w.DS.listener = undefined;
                w.DS.title = '';
                w.DS.author = '';
            })

            w.addEventListener('click', function(e) {

                if (w.DS.listener) {
                    e.preventDefault();

					if (d.getElementById('title').checked) {
						w.DS.title = e.target.textContent;
						d.getElementById('author').checked = true;
	                    d.querySelector('.ds-helper_button').style.display = 'block';
					} else {
						w.DS.author = e.target.textContent;
					}

                    d.querySelector('.ds-helper_ac').value = w.DS.title || '';
					d.querySelector('.ds-helper_author').value = w.DS.author || '';
                }
            })

            d.querySelector('.ds-helper_url').addEventListener('blur', function() {
                if (w.DS.listener) {
                    w.DS.href = d.querySelector('.ds-helper_url').value;
                }
            })

        })();

    })();

})(window, document);