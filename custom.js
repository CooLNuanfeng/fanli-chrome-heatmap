(function(){
    chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
        console.log(sendResponse);
        // if(request.greeting === 'hello'){
        //     console.log('get in');
        //     sendResponse({'farewell':'good night'})
        // }
    });
    setTimeout(function(){
        var oWarp = document.createElement('div');
        var oContain = document.createElement('div');
        var body = document.body;
        var bodyStyle = getComputedStyle(body);
        var firstDom = body.firstChild;
        var heatmap;

        oWarp.style.width = bodyStyle.width;
        oWarp.style.height = bodyStyle.height;
        oWarp.style.position = 'absolute';
        oWarp.style.top = 0;
        oWarp.style.left = 0;


        oContain.style.width = "100%";
        oContain.style.height = "100%";
        oWarp.appendChild(oContain);
        body.insertBefore(oWarp,firstDom);

        //数据
        var data = [];
        function getRandom(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }
        for(var i=0; i<10; i++){
            data.push({
                x : getRandom(0,parseInt(bodyStyle.width)),
                y : getRandom(0,parseInt(bodyStyle.height)),
                value : getRandom(0,100)
            });
        }
        console.log(data,'data');

        oWarp.style.background = 'rgba(0,0,0,.5)';
        oWarp.style.zIndex = 9999999;

        heatmap = h337.create({
            container: oContain,
            radius: 60
        });
        heatmap.setData({
          max: 100,
          data: data
        });
    },5000);
})();
