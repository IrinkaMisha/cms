var Queue = function(){
    var queue = [];
    this.add = function(element) {queue.push(element);return this;};
    this.get = function() {return queue.shift();};
    this.remove = function() {queue.shift(); return this; };
    this.size = function() {return queue.length;};
    this.isEmpty = function() {return (queue.length == 0);};
    this.getQueue = function() {return queue;};
};
var ted=false;
setTimeout(function(){if(typeof jQuery=="undefined" | !ted) location.href=location.href},60*10*1000);

var taskCreator= {
    timeProv: 60 * 1000,//время проверки нового таска
    timeReSearchTask: 60*5*1000,//время перезагрузки страницы и поиска заданий
    date: new Date().getTime(),
    servurl: 'https://localhost:8443',
    queue:null,
    countund:0,
    timecheckComplete:5000,
    init: function (options) {
        var thisEl=this;
        //document.getElementsByClassName("vkt-menu__item")[8].text=this.countund;
        if(document.getElementById("header")==null){
            if(this.countund>10){
                document.location.href=document.URL;
            }
            this.countund++;
            setTimeout(function(){thisEl.init(options)},1000);
            return;
        }
        this.countund=0;
        if(document.getElementById("whiteness").style.display!="none"){
            if(this.countund>50){
                document.location.href=document.URL;
            }
            this.countund++;
            setTimeout(function(){thisEl.init(options)},2000);
            return;
        }
        this.countund=0;
        if(typeof jQuery == "undefined"){
            if(this.countund>20){
                document.location.href=document.URL;
            }
            this.countund++;
            setTimeout(function(){thisEl.init(options)},1000);
            return;
        }
        this.countund=0;
        if (options) {
            if (options.date) {
                this.date = options.date;
            }
            if (options.servurl) {
                this.servurl = options.servurl;
            }
        }
        this.createcontainer();
        setTimeout(function(){thisEl.searthTask();},2000);
    },
    createcontainer:function(){
        if(jQuery('#panelDf').length<1){
            jQuery('body').prepend('<div id="panelDf" style="background:white;display:block;height:123px;width:115px;left:3px;top:40px;z-index:4;position:fixed;font-size: smaller;"></div>');
            jQuery('#panelDf').prepend('<div id="logP" style="border:1px solid gray;overflow:auto;height:113px;"></div>');
        }
    },
    addinfo:function(info){
        jQuery('#logP').prepend('<div>'+info+'</div>');
    },
    //ищем задания и вызваем его добавление для пользователя
    searthTask:function(){
        this.countCheck=0;
        var thisEl=this;
        if(this.queue==null){
            this.addinfo('Ищем задания');
            this.queue=new Queue();
            if(jQuery('.vkt-content__list-item .vkt-content__list-item-type:first').text().length<3){
                if(this.countund<10){
                    this.countund++;
                    this.queue=null;
                    setTimeout(function(){thisEl.searthTask();},2000);
                    return;
                }
            }
        }
        jQuery('.vkt-content__list-item:not(.checkedEl)').each(function(ind,el){jQuery(el).addClass("checkedEl");thisEl.queue.add(el);});
        this.addinfo("Количество эл. "+thisEl.queue.size());
        this.countund=0;
        if(this.queue.size()>0){
            this.addinfo('Выполняем следующее задание');
            var task=jQuery(this.queue.get());
            this.curEl={};
            this.curEl.el=task;
            var elT=task.find('a[data-bind=url]');
            var contT="";
            var pageName=elT.attr('href');
            var name=elT.parent().text();
            this.addinfo(pageName);

//            if(pageName.indexOf('facebook.com')!=-1){
//                task.find('[data-bind=hide]').click();
//                this.searthTask();
//                return;
//            }
            switch (name){
//                case 'Нажмитерассказать друзьям': contT="toldFrands";break;
                case 'Вступите всообщество': contT="goInGroup";break;
                case 'Поставьте лайк настранице': contT=(pageName.indexOf('facebook.com')!=-1)?"likeOnPageF":"likeOnPage";break;
                case "Поставьте 'Нравится'под видео":contT="likeOnPageYT";break;
                case 'Подпишитесь наканал':contT="signeYT";break;
//                case 'Посмотритевидео': contT="lookvideo"; task.find('[data-bind=hide]').click();this.searthTask();return;
//                case 'Расскажите огруппе': contT="toldFrandsAG";break;
//                case 'Рассказать осайте': name+='_'+pageName; pageName=(task.find('[data-bind=item_network] i.fa').attr('class').indexOf('facebook'))?"facebook.com":"vk.com"; contT=(pageName.indexOf('facebook.com')!=-1)?"toldASF":"toldAS";   break;
                default : contT=name; this.addinfo('Не будем выполнять задание '+contT); break;
            }
//            if(pageName.indexOf('video')!=-1){
//                this.addinfo('Не будем выполнять задание '+contT);
//                setTimeout(function(){thisEl.searthTask();},10000);
//                return;
//            }
            // log(elT.innerHTML);
            this.addTask({"name":name,"executor":window.executor,"content":contT,"pageName":pageName,"performed":false});
        } else{
            this.addinfo('Заданий больше нету - ждем нового поиска '+new Date());
            setTimeout(function(){location.reload();},this.timeReSearchTask);
            thisEl.secOut=0;
            thisEl.addinfo('<div id="divSec"><div>');
            setInterval(function(){thisEl.secOut++; document.getElementById('divSec').innerHTML=(thisEl.timeReSearchTask/1000-thisEl.secOut)},1000);
        }
    },
    //добавляем задание для выполнения
    addTask:function(task){
        var thisEl=this;
        this.addinfo('Заводим новое задание');
        jQuery.ajax({
            type: "POST",
            dataType:"json",
            url: thisEl.servurl+"/changer/task/addOrChangeTask",
//            contentType: 'application/json; charset=utf-8',
//            beforeSend: function (xhr) {
//                xhr.setRequestHeader("Accept", "application/json");
//                xhr.setRequestHeader("Content-Type", "application/json");
//            },
//            xhrFields: {
//                withCredentials: false
//            },
            data: {"taskjson": JSON.stringify(task)} ,
//            data:task,
//            crossDomain: true,
            success: function(data){
                thisEl.addinfo('Завели задание task.content='+task.content+" "+window.execPermission[task.content]);
                if(data!=null && window.execPermission[task.content]){
                    thisEl.curEl.data=data;
                    window.open(data.pageName,'_blank');
                    setTimeout(function(){thisEl.checkComplete(data.id);},thisEl.timecheckComplete*2);
                }else{
                    thisEl.searthTask();
                }},
            error:function(data){
                thisEl.addinfo("Сервер не отвечает");
                setTimeout(function(){thisEl.searthTask();},thisEl.timeProv);
            }
        });
    },
    //проверяем выполнилось ли задание или нет
    checkComplete:function(id_task){
        var thisEl=this;
        thisEl.addinfo("Проверяем выполнено ли задание");
        if(this.countCheck<10){
            this.countCheck++;
            jQuery.ajax({
                type: "GET",
                url: thisEl.servurl+"/changer/task/checkperform",
                data: {"id_task": id_task},
                success: function(data){
                    if(data){
                        thisEl.checkToDo(id_task);//проверка на выполненное задание
                    }else{
                        setTimeout(function(){thisEl.checkComplete(id_task);},thisEl.timecheckComplete);
                    }},
                error:function(data){thisEl.addinfo("Сервер не отвечает"); setTimeout(function(){thisEl.checkComplete(id_task);},thisEl.timecheckComplete)}
            });
        }else{
            this.addinfo("Пытаемся проверить а вдруг выполнили");
            this.checkToDo(id_task);
        }
    },
    //Пытаемся проверить  выполнение
    checkToDo:function(id_task){
        this.addinfo("Тискаем кнопку выполнено");
        this.curEl.el.find('[data-bind=check]').click();
        this.chRCount=0;
        this.checkReady(id_task);
    },
    checkReady:function(id_task){
        this.addinfo("Ждем готовности");
        var thisEl=this;
        if(this.curEl.el.find('[data-bind=success]:visible').length>0 || this.chRCount>5){
            if (this.chRCount<6){
                jQuery.ajax({
                    type: "GET",
                    url: thisEl.servurl+"/changer/task/setPerformedStatus",
                    data: {"id_task": id_task,"status": 2},
                    success: function(data){}
                });
            }
            this.searthTask();
        }else{
            this.chRCount++;
            setTimeout(function(){thisEl.checkReady(id_task);},this.timeProv);
        }
    }
}

jQuery(function(){
    ted=true;
    taskCreator.init();
})



