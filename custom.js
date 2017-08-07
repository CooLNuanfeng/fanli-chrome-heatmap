(function(){
    var proUrl = 'http://research.office.51fanli.com/web/reliImgMergData.php';
    var devUrl = 'http://research.com/reliImgMergData.php';

    var oWarp; //热力图容器
    var domDataArr = []; //数据展示记录
    var $hoverDiv;  //数据展示浮层div

    chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
        request.id = sender.id;
        if(request.type == 1){  //热力图
            sendResponse({'status': 0});
            if(domDataArr.length){
                $.each(domDataArr,function(index,item){
                    item.remove();
                });
                domDataArr.length = 0;
                $hoverDiv = null;
            }
            createHeatmap(request);
        }

        if(request.type == 2){ //统计数据
            sendResponse({'status': 0});
            if(oWarp){
                $(oWarp).remove();
            }
            if(domDataArr.length){
                $.each(domDataArr,function(index,item){
                    item.remove();
                });
                domDataArr.length = 0;
                $hoverDiv = null;
            }
            createDataInfo(request);
        }
    });


    function createDataInfo(dataJson){
        var resultData = null;

        var param = {
            'target_url' : encodeURIComponent(window.location.href),
            "type" : 'click',
            "start_date" : dataJson.start,
            "end_date" : dataJson.end,
        };
        $.ajax({
            url : proUrl,
            type : 'get',
            data : param,
            dataType : 'json'
        }).done(function(res){
            if(!res.data){
                alert('数据格式不正确');
                return;
            }
            resultData = res.data.items;
            var totalpv = res.data.totalPV;
            var totaluv = res.data.totalUV;
            var pv = res.data.totalClickPV;
            // console.log(resultData);
            chrome.runtime.sendMessage({'status':1});

            $hoverDiv = $('<div></div>');
            $.each(resultData,function(index,item){
                // console.log(item.xpath);
                var $dom = getDom(item.xpath),$div = $('<div data-path="'+item.xpath+'"></div>'); // data-path="'+item.xpath+'"
                domDataArr.push($div);
                if(!$dom || !$dom.offset()){
                    return;
                }
                var t = $dom.offset().top,
                    l = $dom.offset().left,
                    w = $dom.outerWidth(),
                    h = $dom.outerHeight();

                $div.html(item.clickpv+' ('+ toDecimal((item.clickpv/pv)*100)+'%)').css({
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
                    'fontSize' : 12,
                    'cursor' : 'pointer',
                    'overflow' : 'hidden'
                });
                $div.on('mouseenter',function(ev){
                    $hoverDiv.html('页面访问次数: '+totalpv+' <br>页面访问人数: '+totaluv+' <br>当前点击数: '+item.clickpv+' <br>当前点击人数: '+item.clickuv+' <br>占比: '+toDecimal((item.clickpv/pv)*100)+'%').css({
                        'position' : 'absolute',
                        'top' : t + h,
                        'left' : l,
                        'width' : w <= 200 ? 200: (w-20),
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

        }).fail(function(){
            alert('请求数据失败，请重试');
        });


    }

    function getDom(xPath){
        if(/^html\/body/.test(xPath)){
            var reg = /\/([a-z]+)\[(\d+)\]/g;
        	var tagReg = /[a-z]+/;
        	var childReg = /\d+/;
        	var treeDomArr = xPath.match(reg);
        	var treeLen = treeDomArr.length;
        	var $dom = $('body');
        	for(var i=0; i<treeLen; i++){
        		var tagName = treeDomArr[i].match(tagReg)[0];
                var childIndex = treeDomArr[i].match(childReg)[0];
        		if($dom.children().eq(childIndex)[0] && $dom.children().eq(childIndex)[0].tagName.toLowerCase() == tagName){
        			$dom = $dom.children().eq(childIndex);
        		}else{
        			return null;
        		}
        	}
        	return $dom;
        }else{
            return null;
        }
    }
    function toDecimal(x) {
      var f = parseFloat(x);
      if (isNaN(f)) {
        return;
      }
      f = Math.round(x*1000)/1000;
      return f;
    }







    function makerData(arr){
        var result = [], winW = window.innerWidth || document.documentElement.clientWidth || document.body.offsetWidth;

        $.each(arr,function(index,item){
            var json = {
                'x' : item.x + winW/2,
                'y' : item.y,
                'value' : item.value
            };
            result.push(json);
        });
        // console.log(result,'result');
        result.unshift({x: 0, y: 0, value: 0}); //debug heatmap a strange bug
        return result;
    }

    function createHeatmap(dataJson){
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
        oWarp.style.zIndex = 9999;
        oWarp.appendChild(oContain);
        body.insertBefore(oWarp,firstDom);
        heatmap = h337.create({
            container: oContain,
            radius: 20,
            maxOpacity: 0.4,
            backgroundColor: 'rgba(0,0,0,.5)'
        });

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
            url : proUrl,
            type : 'get',
            data : param,
            dataType : 'json'
        }).done(function(res){
            var rdata = res.data;
            // console.log(rdata,'res.data');
            if(!rdata.length){
                alert('数据为空');
                return;
            }
            heatmap.setData({
              max: 50,
              data: makerData(rdata)
            });
            chrome.runtime.sendMessage({'status':1});
            return oWarp;
        }).fail(function(){
            alert('请求数据失败，请重试');
        });

    }
})();
