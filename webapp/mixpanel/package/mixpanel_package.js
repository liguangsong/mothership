var currentEnv = "ONLINE";

var UserRelated;
var LearningRelated;
var Utils;

if(currentEnv === "ONLINE"){

    UserRelated = {

        identifyId: function(id){
            mixpanel.identify(id);
        },

        // SP means super properties, which is an usage of Mixpanel.
        registerSP: function(id,user_name,name,user_group){
            mixpanel.register({
                UserId:id,
                UserName:user_name,
                Name:name,
                UserGroup:user_group
            });
        },

        login: function(callback){
            mixpanel.track("Login");
        },

        logout: function(){
            mixpanel.track("Logout");
            unregisterAllSP();
        },

        setActive: function(callback){
            mixpanel.people.set_once("FirstActive", new Date());
            mixpanel.people.set("LastActive", new Date());
        },

        setProfile: function(id,user_name,name,user_group){
            mixpanel.people.set({
                UserId:id,
                UserName:user_name,
                $name:name, // SP to show on Profile MainPage.
                UserGroup:user_group
            })
        }
    }


    LearningRelated = {

        enterChapter: function(chapter_id,chapter_title){
            mixpanel.track("EnterChapter",{ChapterId:chapter_id, ChapterTitle:chapter_title});
            mixpanel.register({ChapterId:chapter_id,ChapterTitle:chapter_title});
        },

        enterLesson: function(lesson_id,lesson_title){
            mixpanel.track("EnterLesson",{LessonId:lesson_id, LessonTitle:lesson_title});
            mixpanel.register({LessonId:lesson_id,LessonTitle:lesson_title});
        },

        enterVideo: function(id,title){
            mixpanel.track("EnterVideo",{VideoId:id, VideoTitle:title});
        },

        finishVideo: function(id,title,length,played_length,played_ratio){
            mixpanel.track("FinishVideo",{VideoId:id, VideoTitle:title, VideoLength:Math.floor(length), VideoPlayedLength:Math.floor(played_length), VideoPlayedRatio:played_ratio});
        },

        rateVideo: function(id,title,rating){
            mixpanel.track("RateVideo",{VideoId:id, VideoTitle:title, VideoRating:rating});
        },

        enterQuiz: function(quiz_id,quiz_title){
            mixpanel.track("EnterQuiz",{QuizId:quiz_id, QuizTitle:quiz_title});
            mixpanel.register({QuizId:quiz_id,QuizTitle:quiz_title});
        },

        finishProblem: function(is_hyper,video_id,video_title,timeline,id,body,type,correct_answer,user_answer,correct_or_not,hint_or_not,time_spent){
            mixpanel.track("FinishProblem",{
                ProblemId:id,
                ProblemBody:body,
                ProblemType:type,
                CorrectAnswer:correct_answer,
                UserAnswer:user_answer,
                CorrectOrNot:correct_or_not, //boolean
                HintOrNot:hint_or_not, //boolean
                TimeSpent:time_spent,
                HyperVideo:is_hyper, //boolean
                VideoId:video_id,
                VideoTitle:video_title,
                TimeLine:timeline
            });
        },

        finishQuiz: function(quiz_id,quiz_title,correctRatio,time_spent){
            mixpanel.track("FinishQuiz",{QuizId:quiz_id,QuizTitle:quiz_title,CorrectRatio:correctRatio,TimeSpent:Math.floor(time_spent)});
            Utils.unregisterQuiz();
        },

        finishLesson: function(lesson_id,lesson_title,star,correct_count,correct_percent,pass){
            mixpanel.track("FinishLesson",{LessonId:lesson_id, LessonTitle:lesson_title, Star:star, CorrectCount:correct_count,CorrectPercent:correct_percent, Pass:pass});
            Utils.unregisterLesson();
        },

        quitChapter: function(){
            Utils.unregisterChapter();
        },

        quitLesson: function(){
            Utils.unregisterLesson();
        }
    }

    Utils = {

        unregisterQuiz: function(){
            mixpanel.unregister("QuizId");
            mixpanel.unregister("QuizTitle");
        },

        unregisterLesson: function(){
            this.unregisterQuiz();
            mixpanel.unregister("LessonId");
            mixpanel.unregister("LessonTitle");
        },

        unregisterChapter: function(){
            this.unregisterLesson();
            mixpanel.unregister("ChapterId");
            mixpanel.unregister("ChapterTitle");
        },

        unregisterUserInfo: function(){
            mixpanel.unregister("UserName");
            mixpanel.unregister("Name");
            mixpanel.unregister("UserId");
            mixpanel.unregister("UserGroup");
        }
    }

}else if(currentEnv === "OFFLINE"){

    UserRelated = {

        identifyId: function(id){
            offline_mixpanel.setMixpanelTokenAndUserId(usedToken, id);
            mixpanel.identify(id);
        },

        // SP means super properties, which is an usage of Mixpanel.
        registerSP: function(id,user_name,name,user_group){
            offline_mixpanel.register({
                UserId:id,
                UserName:user_name,
                Name:name,
                UserGroup:user_group
            });
        },

        login: function(callback){
            offline_mixpanel.track("Login");
        },

        logout: function(){
            offline_mixpanel.track("Logout");
            unregisterAllSP();
        },

        // Because "people" can't work in mixpanel's import API, we couldn't make it offline.
        setActive: function(callback){
            mixpanel.people.set_once("FirstActive", new Date());
            //I only hava one chance that the user is abs online. Use LastSeen property by origin Mixpanel instead. 
            //mixpanel.people.set("LastActive", new Date());  
        },

        setProfile: function(id,user_name,name,user_group){
            mixpanel.people.set({
                UserId:id,
                UserName:user_name,
                $name:name, // SP to show on Profile MainPage.
                UserGroup:user_group
            })
        }
    }

    LearningRelated = {

        enterChapter: function(chapter_id,chapter_title){
            offline_mixpanel.track("EnterChapter",{ChapterId:chapter_id, ChapterTitle:chapter_title});
            offline_mixpanel.register({ChapterId:chapter_id,ChapterTitle:chapter_title});
        },

        enterLesson: function(lesson_id,lesson_title){
            offline_mixpanel.track("EnterLesson",{LessonId:lesson_id, LessonTitle:lesson_title});
            offline_mixpanel.register({LessonId:lesson_id,LessonTitle:lesson_title});
        },

        enterVideo: function(id,title){
            offline_mixpanel.track("EnterVideo",{VideoId:id, VideoTitle:title});
        },

        finishVideo: function(id,title,length,played_length,played_ratio){
            offline_mixpanel.track("FinishVideo",{VideoId:id, VideoTitle:title, VideoLength:Math.floor(length), VideoPlayedLength:Math.floor(played_length), VideoPlayedRatio:played_ratio});
        },

        rateVideo: function(id,title,rating){
            offline_mixpanel.track("RateVideo",{VideoId:id, VideoTitle:title, VideoRating:rating});
        },

        enterQuiz: function(quiz_id,quiz_title){
            offline_mixpanel.track("EnterQuiz",{QuizId:quiz_id, QuizTitle:quiz_title});
            offline_mixpanel.register({QuizId:quiz_id,QuizTitle:quiz_title});
        },

        finishProblem: function(is_hyper,video_id,video_title,timeline,id,body,type,correct_answer,user_answer,correct_or_not,hint_or_not,time_spent){
            offline_mixpanel.track("FinishProblem",{
                ProblemId:id,
                ProblemBody:body,
                ProblemType:type,
                CorrectAnswer:correct_answer,
                UserAnswer:user_answer,
                CorrectOrNot:correct_or_not, //boolean
                HintOrNot:hint_or_not, //boolean
                TimeSpent:time_spent,
                HyperVideo:is_hyper, //boolean
                VideoId:video_id,
                VideoTitle:video_title,
                TimeLine:timeline
            });
        },

        finishQuiz: function(quiz_id,quiz_title,correctRatio,time_spent){
            offline_mixpanel.track("FinishQuiz",{QuizId:quiz_id,QuizTitle:quiz_title,CorrectRatio:correctRatio,TimeSpent:Math.floor(time_spent)});
            Utils.unregisterQuiz();
        },

        finishLesson: function(lesson_id,lesson_title,star,correct_count,correct_percent,pass){
            offline_mixpanel.track("FinishLesson",{LessonId:lesson_id, LessonTitle:lesson_title, Star:star, CorrectCount:correct_count,CorrectPercent:correct_percent, Pass:pass});
            Utils.unregisterLesson();
        },

        quitChapter: function(){
            Utils.unregisterChapter();
        },

        quitLesson: function(){
            Utils.unregisterLesson();
        }
    }

    Utils = {

        unregisterQuiz: function(){
            offline_mixpanel.unregister("QuizId");
            offline_mixpanel.unregister("QuizTitle");
        },

        unregisterLesson: function(){
            this.unregisterQuiz();
            offline_mixpanel.unregister("LessonId");
            offline_mixpanel.unregister("LessonTitle");
        },

        unregisterChapter: function(){
            this.unregisterLesson();
            offline_mixpanel.unregister("ChapterId");
            offline_mixpanel.unregister("ChapterTitle");
        },

        unregisterUserInfo: function(){
            offline_mixpanel.unregister("Name");
            offline_mixpanel.unregister("UserName");
            offline_mixpanel.unregister("UserId");
            offline_mixpanel.unregister("UserGroup");
        }
    }
}
/////////////////////////////////////////////////////////////////

function initMixpanelWithSP(id,user_name,name,user_group){
    UserRelated.identifyId(id);
    UserRelated.registerSP(id,user_name,name,user_group);
}

function signIn(id,user_name,name,user_group){
    UserRelated.login(UserRelated.setActive(UserRelated.setProfile(id,user_name,name,user_group)));
}

function unregisterAllSP(){
    Utils.unregisterChapter();
    Utils.unregisterUserInfo();
}