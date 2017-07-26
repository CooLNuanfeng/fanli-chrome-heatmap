(function(){
    chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
        request.id = sender.id;
        if(request.type == 1){  //热力图
            createHeatmap(request);
        }

        if(request.type == 2){ //统计数据
            createDataInfo();
            sendResponse({'response':'ok'})
        }
    });


    function createDataInfo(){
        var resultData = [
            {'xpath' : 'html/body/section[2]/div[1]/div[1]/ul[0]/li[1]/a[0]','click': 1256},
            {'xpath' : 'html/body/section[2]/div[1]/div[1]/div[2]/div[0]/div[0]/div[0]/ul[0]/li[6]/a[0]', 'click': 2556},
            {'xpath': 'html/body/section[2]/div[1]/div[1]/div[2]/div[0]/div[0]/div[0]/ul[0]/li[9]/a[0]','click': 1543},
            {'xpath' : 'html/body/section[2]/div[1]/div[0]/div[1]/a[13]','click' : 15266},
            {'xpath' : 'html/body/section[2]/div[1]/div[1]/div[2]/div[1]/div[1]/a[0]','click' : 166},
            {'xpath' : 'html/body/section[2]/div[1]/div[1]/div[2]/div[0]/div[1]/div[1]/a[1]', 'click' : 520}
        ];
        var $hoverDiv = $('<div></div>');
        $.each(resultData,function(index,item){
            var $dom = getDom(item.xpath),$div = $('<div></div>');
            var t = $dom.offset().top,
                l = $dom.offset().left,
                w = $dom.outerWidth(),
                h = $dom.outerHeight();

            $div.html(item.click).css({
                'position' : 'absolute',
                'top' : t,
                'left' : l,
                'width' : w,
                'height' : h,
                'lineHeight' : h +'px',
                'textIndent' : '5px',
                'background' : 'rgba(0,0,0,.7)',
                'zIndex' : 99999,
                'color' : '#fff',
                'fontSize' : 16,
                'cursor' : 'pointer',
                'overflow' : 'hidden'
            });
            $div.on('mouseenter',function(ev){
                $hoverDiv.html('总点击量: 12345 <br>总浏览量: 3555 <br>当前点击数: 124 <br>占比: 4%').css({
                    'position' : 'absolute',
                    'top' : t + h,
                    'left' : l,
                    'width' : w <= 150 ? 150: (w-20),
                    'padding' : 10,
                    'zIndex' : 99999,
                    'color' : '#fff',
                    'fontSize' : 16,
                    'overflow' : 'hidden',
                    'background' : 'rgba(0,0,0,.7)'
                }).show();
            }).on('mouseleave',function(ev){
                $hoverDiv.hide();
            });
            $('body').append($div);
            $('body').append($hoverDiv);
        });
        $hoverDiv.on('mouseenter',function(ev){
            $hoverDiv.show();
        }).on('mouseleave',function(){
            $hoverDiv.hide();
        });
    }

    function getDom(xPath){
    	var reg = /(\d+)/g;
    	var treeDomArr = xPath.match(reg);
    	var treeLen = treeDomArr.length;
    	var $dom = $('body');
    	for(var i=0; i<treeLen; i++){
    		$dom = $dom.children().eq(treeDomArr[i]);
    	}
    	return $dom;
    }







    function makerData(data){
        var result = [], winW = window.innerWidth || document.documentElement.clientWidth || document.body.offsetWidth;
        $.each(data,function(index,item){
            var json = {
                'x' : item.x + winW/2,
                'y' : item.y,
                'value' : item.value
            };
            result.push(json);
        });
        return result;
    }

    function createHeatmap(dataJson){
        var oWarp;
        var renderData;
        var oContain = document.createElement('div');
        var body = document.body;
        var bodyStyle = getComputedStyle(body);
        var firstDom = body.firstChild;
        var heatmap;
        if(document.getElementById(dataJson.id)){
            oWarp = document.getElementById(dataJson.id);
            oWarp.innerHTML = '';
        }else{
            oWarp = document.createElement('div');
            oWarp.id = dataJson.id;
        }

        oWarp.style.width = bodyStyle.width;
        oWarp.style.height = parseInt(bodyStyle.height) > 32760 ? 32760 +'px' : bodyStyle.height;  //32767
        oWarp.style.position = 'absolute';
        oWarp.style.top = 0;
        oWarp.style.left = 0;

        oContain.style.position = 'relative';
        oContain.style.width = "100%";
        oContain.style.height = "100%";
        oWarp.appendChild(oContain);
        body.insertBefore(oWarp,firstDom);

        // var sql = "select top 10 * from dw.dm.incr_d_tra_ubt_coordinate where url = '"+window.location.href+"'";
        // if(!dataJson.flag){
        //     sql += " and ds >='"+dataJson.start+"' and ds < '"+dataJson.end+"'";
        // }
        //
        var param = {
            "target_url" : encodeURIComponent(window.location.href),
            "start_date" : dataJson.start,
            "end_date" : dataJson.end,
        };
        $.ajax({
            url : 'http://ny.fanli.com/reliImgMergData.php',
            type : 'get',
            data : param,
            dataType : 'json'
        }).done(function(res){
            console.log(res.data,'res');
            var data = res.data;
            renderData = makerData(data);
            oWarp.style.zIndex = 9999;
            console.log(renderData);
            heatmap = h337.create({
                container: oContain,
                radius: 10,
                backgroundColor: 'rgba(0,0,0,.5)'
            });
            heatmap.setData({
              max: 20,
              data: renderData
            });
        }).fail(function(){
            alert('请求数据失败，请重试');
        });

    }
})();
