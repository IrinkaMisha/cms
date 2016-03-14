package by.nulay.changer.parser;

import by.nulay.changer.ChangerException;
import by.nulay.changer.parser.MegacriticParser;
import by.nulay.changer.parser.ParserImpl;
import by.nulay.changer.parser.SerialochkaParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.support.FileSystemXmlApplicationContext;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

/**
 * Created by miha on 23.01.2016.
 */
@Component("StartServiceChange")
public class StartServiceChange {
    @Autowired
            @Qualifier("MegacriticParser")
    ParserImpl megacriticParser;
    @Autowired
            @Qualifier("SerialochkaParser")
    ParserImpl serialochkaParser;

    @Scheduled(fixedRate = 14400000)
    public void startCheckFilms( ) throws IOException{
        megacriticParser.startParseAndSave();
        serialochkaParser.startParseAndSave();
    }
}
