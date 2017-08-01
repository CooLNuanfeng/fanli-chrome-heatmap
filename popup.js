(function(){
    var mapBtn = document.getElementById('btn-heatmap');
    var dataBtn = document.getElementById('btn-heatdate');
    var toggleBtns = document.querySelectorAll('.panel-toggle');
    var timeBox = document.querySelector('.panel-time');
    var todayFlag = true;
    var startTime = document.getElementById('start');
    var endTime = document.getElementById('end');
    var notice = document.querySelector('.notice');

    document.addEventListener('click',function(ev){
        if(ev.target.className === 'panel-toggle'){
            for(var i=0; i<toggleBtns.length; i++){
                toggleBtns[i].classList.remove('active');
            }
            ev.target.classList.add('active');
            if(ev.target.getAttribute('data-flag')){
                timeBox.style.display = 'block';
                todayFlag = false;
            }else{
                timeBox.style.display = 'none';
                notice.style.display = 'none';
                todayFlag = true;
            }
        }

    });

    dataBtn.onclick = function(){
        if(hasClass(dataBtn,'btn-disable')){
            return;
        }
        message(2);
    };

    mapBtn.onclick = function(){
        if(hasClass(mapBtn,'btn-disable')){
            return;
        }
        message(1);
    };


    chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
        //console.log(request,sender,sendResponse);
        if(request.status == 1){
            dataBtn.classList.remove('btn-disable');
            mapBtn.classList.remove('btn-disable');
        }
    });


    function message(type){
        var sendJson = {
            'flag' : todayFlag,
            'start' : startTime.value,
            'end' : endTime.value,
            'type' : type
        };
        if(!todayFlag && (!sendJson.start || !sendJson.end)){
            notice.style.display = 'block';
        }else{
            notice.style.display = 'none';
            chrome.tabs.query({active:true,currentWindow:true},function(tabs){
                chrome.tabs.sendMessage(tabs[0].id,sendJson,function(response){
                    //console.log(response.status);
                    if(response.status == 0){ //fetching
                        if(type == 2){
                            dataBtn.classList.add('btn-disable');
                        }
                        if(type == 1){
                            mapBtn.classList.add('btn-disable');
                        }
                    }
                });
            });
        }
    }

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

})();
