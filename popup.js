(function(){
    var oBtn = document.getElementById('btn');
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

    oBtn.onclick = function(){
        var sendJson = {
            'flag' : todayFlag,
            'start' : startTime.value,
            'end' : endTime.value
        };
        if(!todayFlag && (!sendJson.start || !sendJson.end)){
            notice.style.display = 'block';
        }else{
            notice.style.display = 'none';
            chrome.tabs.query({active:true,currentWindow:true},function(tabs){
                chrome.tabs.sendMessage(tabs[0].id,sendJson,function(response){
                });
            });
        }
    };

})();
