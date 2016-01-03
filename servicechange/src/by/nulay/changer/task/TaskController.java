package by.nulay.changer.task;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Date;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: miha
 * Date: 22.10.14
 * Time: 21:04
 * To change this template use File | Settings | File Templates.
 */
@Controller("TaskController")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaskController {
    private TaskService jobService;

    @Autowired
    private TaskSaveAction taskSaverOnTheFile;
    @Autowired
    private ServletContext servletContext;

    @Autowired
    public TaskController(TaskService jobService){
        this.jobService = jobService;
    }


    @RequestMapping(value = "changer/task/gettasks", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE)
    public @ResponseBody List<Task> getTasks(@RequestParam("perform")Boolean perform, @RequestParam("executor")String executor) {
        return jobService.getTasks(perform, executor);
    }

//    @CrossOrigin
    @RequestMapping(value = "changer/task/addOrChangeTask", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public @ResponseBody Task addOrChangeTask(@RequestParam String taskjson, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin","*");
//            response.addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//            response.addHeader("Access-Control-Allow-Credentials", "true");
//            response.addHeader("Access-Control-Allow-Headers",
//                    request.getHeader("Access-Control-Request-Headers"));
        ObjectMapper mapper = new ObjectMapper();
        Task task=null;
        try {
            task = mapper.readValue(taskjson, Task.class);
        } catch (IOException e) {
            e.printStackTrace();
        }
        if(task!=null && task.getPageName()!=null && task.getPageName()!=""){
            //task.setPageName(task.getPageName().replaceAll("https","http"));
            if(task.getDateexecution()==null){
                task.setDateexecution(new Date());
            }
            task= jobService.addOrChangeTask(task);
            taskjson=taskjson.replaceAll("\"executor\"","\"id\":\""+task.getId()+"\",\"executor\"");
            taskSaverOnTheFile.taskSaveAction("document.facebookData="+taskjson+";",servletContext.getRealPath("/resources/js/forTemperData/tempData_"+task.getExecutor()+".user.js"));
        }
        return task;
    }

    @RequestMapping(value = "changer/task/getnexttask", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE)
    public @ResponseBody Task getNextTask(@RequestParam("executor")String executor,HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin","*");
//        Task task=new Task();
//        task.setName("addVKontactGrMessage");
//        task.setPageName("http://vk.com/notgravity");
//        task.setExecutor("/id269973709");
//        task.setDateexecution(new Date());
//        task.setContent("Hello start Task");
//        jobService.addOrChangeTask(task);
        return jobService.getNextTask(executor);
    }

    @RequestMapping(value = "changer/task/gettaskforPage", method = RequestMethod.POST, produces=MediaType.APPLICATION_JSON_VALUE)
    public @ResponseBody Task getTaskForPage(@RequestParam("executor")String executor,@RequestParam("pageName")String pageName,HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin","*");
        Task t= jobService.getTaskForPage(pageName,executor);
        return t;
    }

    @RequestMapping(value = "changer/task/checkperform", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE)
    public @ResponseBody boolean checkPerform(@RequestParam("id_task") Long id_task,HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin","*");
        return jobService.checkPerform(id_task);
    }

    @RequestMapping(value = "changer/task/markcomleted", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE)
    public @ResponseBody boolean markComleted(@RequestParam("id_task") Long id_task, String executor, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin","*");
        taskSaverOnTheFile.taskSaveAction("document.facebookData=null;",servletContext.getRealPath("/resources/js/forTemperData/tempData_"+executor+".user.js"));
        return jobService.markComleted(id_task);
    }

    @RequestMapping(value = "changer/task/setPerformedStatus", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE)
    public @ResponseBody boolean setPerformedStatus(@RequestParam("id_task") Long id_task,@RequestParam("status") Integer status,HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin","*");
        return jobService.setPerformedStatus(id_task,status);
    }

    @RequestMapping(value = "changer/task/hello", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE)
    public @ResponseBody String hello(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin","*");
        return "hell";
    }
}
