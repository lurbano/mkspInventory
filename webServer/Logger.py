import time
from tinydb import TinyDB, Query
import json

class studentLogger:

    def __init__(self, handler, db_dir):
        self.db_dir = db_dir
        self.timeDB = TinyDB(db_dir+'timeLog.json')
        self.handler = handler

    def logSignIn(self, info):
        print('hi', info)
        try:
            self.timeDB.insert(info)
            self.handler.write_message({'info':'sign in', 'msg':info['action']+" successful."})
        except:
            self.handler.write_message({'info':'sign in', 'msg':"Error: Failed to sign in."})

    def getAll(self, studentId, what = "selectStudent"):
        studentId = int(studentId)
        stu = Query()
        result = self.timeDB.search(stu.id == studentId);
        print(f'Student {studentId}:', result)
        self.handler.write_message({
                                    'info': what,
                                    'studentId': studentId,
                                    'msg': json.dumps(result)
                                  })

    def getEverything(self, what = "getStudentDB"):
        stu = Query()
        result = self.timeDB.search(stu.id == studentId);
        print(f'Student {studentId}:', result)
        self.handler.write_message({
                                    'info': what,
                                    'studentId': studentId,
                                    'msg': json.dumps(result)
                                  })


class checkoutLogger:

    def __init__(self, handler, db_dir):
        self.db_dir = db_dir
        # self.logDB = TinyDB(db_dir+'checkoutLog.json')
        self.handler = handler

    def checkout(self, info):
        print('hi', info)

        self.logDB = TinyDB(f'{self.db_dir}{info["itemType"]}.json')

        try:
            self.logDB.insert(info)

            self.handler.write_message({'info':'checkout', 'msg':f'{info["action"]} of {info["itemType"]} ({info["item"]}) by {info["name"]} successful'})

        except:
            self.handler.write_message({'info':'checkout', 'msg':"Error: Failed to Check In/Out (checkoutLogger)"})

    def getAll(self, info):
        self.logDB = TinyDB(f'{self.db_dir}{info["itemType"]}.json')
        id = int(info['id'])
        items = Query()
        result = self.logDB.search(items.itemId == id);
        # print(f'Item {info["itemType"]}:', result)
        self.handler.write_message({
            'info': 'selectItemData',
            'itemType': info['itemType'],
            'id': id,
            'msg': json.dumps(result)
        })

    def getLastStatus(self, msg):

        try:
            itemType = msg['itemType']
            itemNames = msg['itemNames']
            logDB = TinyDB(f'{self.db_dir}{msg["itemType"]}.json')
            status = Query()

            finalStatus = []

            for name in itemNames:
                #print("name:", name)
                result = logDB.search(status.item == name)
                #print("Last Result:", result)
                if (len(result) > 0):
                    finalStatus.append(result[-1])

            self.handler.write_message({
                'info': 'lastStatus',
                'itemType': itemType,
                'msg': json.dumps(finalStatus)
            })
        except:
            print("Error: Failed to get last status from database (getLastStatus)")
            #self.handler.write_message({'info':'checkout', 'msg':"Error: Failed to get last status from database (getLastStatus)"})
