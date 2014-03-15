var getCookie = function(key) {
   var result = false;
   if(document.cookie) {
      var mycookieArray = document.cookie.split(';');
      for(i=0; i<mycookieArray.length; i++) {
         var mykeyValue = mycookieArray[i].split('=');
         if(mykeyValue[0].replace(/^\s+|\s+$/g, '') == key) result = mykeyValue[1];
      }
   }
   return result;
};