console.log("taskExecutorFPload_v5");
var taskExecutorFP={
    timeProv:60*1000,//время проверки нового таска
    date:new Date().getTime(),
    servurl:'https://localhost:8443',
    servError:0,
    countund:0,
    prInd:0,
    init:function(options){
        var thisEl=this;
        console.log("taskExecutorFPstart");
        if(options){
            if(options.date){
                this.date=options.date;
            }
            if(options.servurl){
                this.servurl=options.servurl;
            }
        }
        this.getTaskForPage(location.href);
    },
    createcontainer:function(){
        if(jQuery('#panelDf').length<1){
            jQuery('body').prepend('<div id="panelDf" style="background:white;display:none;height:123px;width:40px;left:3px;top:40px;z-index:4;position:fixed;font-size: smaller;"></div>');
            jQuery('#panelDf').prepend('<div id="logP" style="border:1px solid gray;overflow:auto;height:113px;"></div>');
        }
    },
    addinfo:function(info){
        console.log(info);
        jQuery('#logP').prepend('<div>'+info+'</div>');
    },
    obrData:function(data,fb){
        var thisEl=this;
        thisEl.createcontainer();
        console.log(data);
        thisEl.addinfo('Получили задание для выполнения fb:'+fb+" pn:"+data.id);
        thisEl.servError=0;
        jQuery('#panelDf').css('display','block');
        switch (data.content){
            case 'goInGroup': thisEl.goInGroup(data.id);break;
            case 'likeOnPageF': setTimeout(function(){thisEl.putLikeFaceBookPage(data.id);},2000);break;
            case 'toldFrandsAG': thisEl.toldFrandsAG(data.id);break;
            case 'likeOnPage': thisEl.likeOnPage(data.id);break;
            case 'likeOnPageYT': thisEl.youtubeLike(data.id);break;
            case 'signeYT':thisEl.signeYoutube(data.id);break;
        }
    },
    getTaskForPage:function(urld){
        console.log("TryGetTasks");
        var thisEl=this;
        try{
            GM_xmlhttpRequest({
                method: "GET",
                url: thisEl.servurl+"/changer/task/gettaskforPage2?executor="+window.executor+"&pageName="+urld,
                onload: function(response) {
                    console.log(response.responseText);
                    thisEl.resComplete(response.responseText);
                } ,
                onerror:function(){
                    thisEl.resComplete(null);
                }
            });
        }catch(e){
            console.log(e);
        }
    },
    resComplete:function(res){
        var thisEl=this;
        console.log("Здесь "+res);
        if(res!=null && res!=""){
            res=JSON.parse(res);
            console.log(res);
            if(res!=null && res.id>0) {
                thisEl.getTaskForPage(res);
            }
            return null;
        }else{
            if(this.chURL!=1){
                if(location.href.indexOf("facebook.com")!=-1){
                    console.log("Повторный запрос facebook");
                    var urlK=document.location.origin+"/"+$('button.PageLikeButton[data-profiled!=e]').attr('data-profileid');
                    console.log(urlK);
                    if(location.href!=urlK){
                        this.chURL=1;
                        getResultHTTP(urlK,thisEl);
                        return;
                    }
                }
            }
            console.log("Ищем задание");
            jQuery.ajax({
                type: "POST",
                url: thisEl.servurl+"/changer/task/gettaskforPage",
                //data: {"executor": jQuery('#myprofile').attr('href')},
                data: {"executor": executor,"pageName":location.href},
                dataType:"json",
                success: function(data){
                    thisEl.pastRequest(data);
                },
                error:function(data){
                    if(thisEl.servError<10){
                        ind++;
                        if(ind>5){
                            return;
                        }
                        setTimeout(function(){thisEl.getTaskForPage(ind);},thisEl.timeProv);
                    }
                }
            });
        }
    },
    pastRequest:function(data){
        var thisEl=this;
        if(data!=null && data.id+""!="undefined"){
            console.log(data);
            thisEl.obrData(data);
        }else{
            this.prInd++;
            if(this.prInd>2){
                return;
            }
            setTimeout(function(){thisEl.getTaskForPage(ind);},3000);
        }
    },
    addVKGrAddMessage:function (content){
        this.addinfo('<b>Делаем запись</b>');
        this.addinfo(new Date().toLocaleString());
        jQuery('#post_field').mousedown();
        jQuery('#post_field').val(content);
        if(!jQuery('#official').hasClass('on') ){
            jQuery('#official').click();
        }
        jQuery('#send_post').click();
    },
    taskComplete:function(id_task){
        this.addinfo("Докладываем о выполнении");
        if(location.href.indexOf("facebook.com")!=-1 && ""+id_task!="undefined"){
            var at=jQuery('a')[0];
            location.href=this.servurl+'/changer/task/markcomleted?id_task='+id_task+'&executor='+window.executor;
            this.addinfo("Закрывааем страницу");
            window.close();
            return;
        }
        this.addinfo("Отправляем доклад о выполнении");
        var thisEl=this;
        if(this.tCGM!=1){
            try{
                GM_xmlhttpRequest({
                    method: "GET",
                    url: thisEl.servurl+"/changer/task/markcomleted",
                    data: {"id_task": id_task,"executor":window.executor},
                    onload: function(data) {
                        if(data){
                            thisEl.addinfo("Выполнили ура.");
                            window.close();
                            // thisEl.getNextTask();
                            setTimeout(function(){thisEl.taskComplete(id_task);},30000)
                        }
                    } ,
                    onerror:function(){
                        thisEl.addinfo("Сервер не отвечает"); setTimeout(function(){thisEl.taskComplete(id_task);},30000)
                    }
                });
            }catch(e){
                console.log(e);
            }
            this.tCGM=1;
        }else{
            if(this.tCGM==4){
                window.close();
                return;
            }
            jQuery.ajax({
                type: "GET",
                url: thisEl.servurl+"/changer/task/markcomleted",
                data: {"id_task": id_task,"executor":window.executor},
                success: function(data){
                    if(data){
                        thisEl.addinfo("Выполнили ура.");
                        window.close();
                        // thisEl.getNextTask();
                        setTimeout(function(){thisEl.taskComplete(id_task);},30000)
                    }},
                error:function(data){thisEl.addinfo("Сервер не отвечает"); setTimeout(function(){thisEl.taskComplete(id_task);},30000)}
            });
            this.tCGM++;
        }
    },
    isYoutubeSign:false,
    signeYoutube:function(idtask){
        console.log("signeYoutube");
        if(!this.checkedYoutubeSigneClick()){
            jQuery('.yt-uix-subscription-button:first')[0].click();
            //jQuery('.yt-uix-button-subscribe-branded')[0].click();
            this.isYoutubeSign=true;
            console.log("signeYoutubeComplete");
            this.checkedWork("checkedYoutubeSigneClick",idtask);
        }else{
            this.addinfo('Уже выполнили');
            this.taskComplete(idtask);
        }
    },
    checkedYoutubeSigneClick:function(){
        return jQuery('.yt-uix-subscription-button:first span span:visible').hasClass('subscribed-label');
    },
    isYoutubeClick:false,
    youtubeLike:function(idtask){
        if(!this.checkedYoutubeClick()){
            jQuery('.like-button-renderer-like-button-unclicked')[0].click();
            this.isYoutubeClick=true;
            this.checkedWork('checkedYoutubeClick',idtask);
        }else{
            this.addinfo('Уже выполнили');
            this.taskComplete(idtask);
        }
    },
    checkedYoutubeClick:function(){
        return jQuery('.like-button-renderer-like-button-unclicked').hasClass("hid");
    },
    putLikeFaceBookPage:function(idtask){
        this.addinfo('Пытаемся выполнить');
        this.addinfo("Проверка на выполнение "+this.chackedLikeFaceBookPage());
        if(!this.chackedLikeFaceBookPage()){
            if(jQuery("#fbProfileCover .PageLikeButton").length>0){
                this.addinfo("клик по .PageLikeButton");
                jQuery('.PageLikeButton')[0].click();
            }else{
                var ch=jQuery('.likeCommentGroup .likeButton:contains(Нравится)');
                if(ch.length>0){
                    this.addinfo("клик по likeButton "+idtask);
                    ch[0].click();
                }else{
                    if(jQuery('.UFILikeLink:contains(Нравится)').length>0){
                        jQuery('.UFILikeLink:contains(Нравится)')[0].click();
                    }else{
                        if(jQuery('PageLikedButton').length>0){
                            this.addinfo("клик по .PageLikeButton");
                            jQuery('.PageLikedButton')[0].click();
                        }
                    }
                }
            }
            this.checkedWork('chackedLikeFaceBookPage',idtask);
        }else{
            this.addinfo('Уже выполнили');
            this.taskComplete(idtask);
        }
    },
    //нужно ли лайкнуть, или уже лайкнуто true-уже все сделано
    chackedLikeFaceBookPage:function(){
        return !(jQuery('.likeCommentGroup .likeButton:contains(Нравится):visible').length>0
            || (jQuery("#fbProfileCover .PageLikeButton").length>0 & jQuery("#fbProfileCover .PageLikeButton .PageLikedButton").length==0)
            || jQuery('.UFILikeLink:contains(Нравится)').length>0);
    },
    checkedWork:function(funcChName, idtask){
        this.countCheck=0;
        this._checkedWork(funcChName, idtask);
    },
    _checkedWork:function(funcChName,idtask){
        var thisEl=this;
        if(this.countCheck>10){
            this.addinfo('Не смогли выполнить');
            window.close();
            return;
        }else{
            this.countCheck++;
        }
        this.addinfo('Выполнили? '+idtask);
        setTimeout(function(){(thisEl[funcChName]())?thisEl.taskComplete(idtask):thisEl._checkedWork(funcChName,idtask);},1000);
    },
    //рассказать о группе 3 метода
    toldFrandsAG:function(idtask){
        if(!this.chackedgoInGroup()){
            jQuery('#group_like_module button').click();
            this.checkedtoldFrandsAG_0(idtask);
        }else{
            this.taskComplete(idtask);
        }
    },
    checkedtoldFrandsAG_0:function(idtask){
        var thisEl=this;
        setTimeout(function(){(jQuery('#group_like_module button').length<1)?thisEl.toldFrandsAG_1(idtask):thisEl.checkedtoldFrandsAG_0(idtask);},1000);
    },
    toldFrandsAG_1:function(idtask){
        jQuery('.group_like_desc_wrap a').click();
        setTimeout(function(){(jQuery('#like_share_send').length<1)?thisEl.toldFrandsAG_1(idtask):thisEl.toldFrandsAG_2(idtask);},1000);
    },
    toldFrandsAG_2:function(idtask){
        jQuery('#like_share_send').click();
        this.checkedWork('checkedtoldFrandsAG_1',idtask);
    },
    checkedtoldFrandsAG_1:function(idtask){
        return true;
    },
    //Вступить в группу
    goInGroup:function(idtask){
        if(!this.chackedgoInGroup()){
            if(jQuery('#group_like_module button:not(._group_send_msg)').length>0){
                jQuery('#group_like_module button:not(._group_send_msg)').click();
            }
            if(jQuery('#subscribe_button').length>0){
                jQuery('#subscribe_button').click();
            }
            this.checkedWork('chackedgoInGroup',idtask);
        }else{
            this.taskComplete(idtask);
        }
    },
    chackedgoInGroup:function(){
        return jQuery('#group_like_module button:not(._group_send_msg)').length<1 && jQuery('#subscribe_button:visible').length<1;
    },
    likeOnPage:function(idtask){
        this.addinfo('Пытаемся лайкнуть запись '+idtask);
        if(location.href.indexOf('photo')!=-1){
            if(!this.checkedLikePhoto()){
                this.addinfo('fotolike');
                try {
                    Photoview.like();
                } catch (e) {
                    if(jQuery('#pv_like_wrap #pv_like_icon').length>0){
                        jQuery('#pv_like_wrap #pv_like_icon')[0].click();
                    }
                }
                this.checkedWork('checkedLikePhoto',idtask);
            }else{
                this.addinfo('fotolike complete');
                this.taskComplete(idtask);
            }
        }else{
            if(!this.chackedlikeOnPage()){
                this.addinfo('justlike');
                this.clickedH(jQuery('.fw_post_info .fw_like_icon'));
                this.clickedH(jQuery('.fw_like_wrap'));
                this.clickedH(jQuery('#bt_rows .bp_post:first .like_wrap.fl_r'));
//                this.clickedH(jQuery('#pv_like_wrap #pv_like_icon'));
                var thisEl=this;
                setTimeout(function(){thisEl.checkedWork('chackedlikeOnPage',idtask);},2000);
            }else{
                this.addinfo('justlike complete');
                this.taskComplete(idtask);
            }
        }
    },
    clickedH:function(per){
        if(per.length>0){
            per.click();
            setTimeout(function(){per.mouseover(); per.mouseout();},1000);
        }
    },
    checkedlikeManyWr:function(){
        return jQuery('#bt_rows .bp_post:first .like_wrap.fl_r i.fl_l').css('opacity')==1;
    },
    checkedLikePhoto:function(){
        return jQuery('#pv_like_icon').css('opacity')==1 | jQuery('#pv_like_wrap').length==0;
    },
    chackedToldAboutGr:function(){
        return false;
    },
    chackedlikeOnPage:function(){
        return jQuery('.fw_post_info .fw_like_icon').css('opacity')==1
            || jQuery('#bt_rows .bp_post:first .like_wrap.fl_r i.fl_l').css('opacity')==1
            || jQuery('.fw_like_icon.fl_l').css('opacity')!=0.4;
//            || jQuery('#pv_like_wrap #pv_like_icon').css('opacity')!=0.4 ;
    }
//    checkedWork:function(funcChName, idtask){
//        var thisEl=this;
//        setTimeout(function(){(thisEl[funcChName])?thisEl.taskComplete(idtask):thisEl.checkedWork(funcChName,idtask);},1000);
//    }
}


function checkJquery(countund){
    try{
        console.log("taskExecutorFPload2");
        jQuery(function(){setTimeout(function(){taskExecutorFP.init()},3000);});
    }catch(e){
        console.log(e);
        countund++;
        if(countund<10)
            setTimeout(function(){checkJquery(countund)},1000);
        else{
            console.log(taskExecutorFP);
            console.log(jQuery);
        }
    }
}

checkJquery(0);

//fds=function(){
//    jQuery('#post_field').mousedown();
//    jQuery('#post_field').click();
//    jQuery('#post_field').val("Привет смотри ссылку   ыва");
//    jQuery('#post_field').val(jQuery('#post_field').val()+"http://syndyk.by/sites/syndyk/img/photoreportage/2800/760x570/image-23038.jpg");
//    jQuery('#post_field').change();
//    var e = jQuery.Event("keyup", { keyCode: 20 });
//    var e2 = jQuery.Event("keyup", { keyCode: 69 });
//    var event = new KeyboardEvent('keypress', {keyCode: 0x20});
//    jQuery('#post_field')[0].dispatchEvent(event);
//    var event2 = new KeyboardEvent('keypress', {keyCode: 0x69});
//    jQuery('#post_field')[0].dispatchEvent(event);
//    jQuery('#post_field').trigger( e );
//    jQuery('#post_field').trigger( e );
//    jQuery('#post_field').trigger( e2 );
//}