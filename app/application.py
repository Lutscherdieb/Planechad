# coding: utf-8
import cherrypy
import string
import cgi
import codecs
import json
import os,os.path
#from cherrypy.lib import file_generator
#import StringIO
from collections import defaultdict
from . import database
#----------------------------------------------------------
class plane_cl(object):
    exposed = True
    def __init__(self):
        self.databases = []
        self.itemCount = 0
        # self.db_o = database.Database_cl("Largos") 
        # toDo. for each folder in data create database for that folder
        for file in os.listdir("./content/img/editions"):
            d = os.path.join("./content/img/editions", file)
            if os.path.isdir(d):
                self.databases.append(database.Database_cl(file))
        
    #-----------------------------------------------------
    @cherrypy.tools.json_out()
    def GET(self,edition = ""):
        #return self.databases[0].getdata()
        # read totalContent from databases WIP
        self.readTotalContent()
        if edition == "":
            return self.totalContent
        
        for db in self.databases:
            if db.name == edition:
                return json.dumps(db.getdata())
        
    #-----------------------------------------------------
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def PUT(self):
        input_json = cherrypy.request.json
        if not(('ID' in input_json) or ('Name' in input_json) or ('Image' in input_json) or ('Edition' in input_json)):
            raise cherrypy.HTTPError(400,message="wrong input parameters")
        for db in self.databases:
            if db.name == input_json['Edition']:
                old_entry = db.getdata(str(input_json['ID']))
                # Add Rating
                if ('Rating' in input_json):
                    old_entry['Rating'][2] += max(min(input_json['Rating'][2],5),1)
                    old_entry['Rating'][1] += 1
                    old_entry['Rating'][0] = round(old_entry['Rating'][2] / old_entry['Rating'][1])

                #Check Tags for new ones
                if ('Tags' in input_json):
                    for entry in input_json['Tags']:
                        if not(entry in old_entry['Tags']):
                            old_entry['Tags'].append(entry)

                for entry in old_entry['Tags']:
                    if not(entry in input_json['Tags']):
                        old_entry['Tags'].remove(entry)

                db.updateplanedata(old_entry,str(input_json['ID']))
                return json.dumps(db.getdata(str(input_json['ID'])))
        return input_json
    #-----------------------------------------------------
    #-----------------------------------------------------
    def readTotalContent(self):
        self.itemCount = 0
        count = 0
        for db in self.databases:
            count = count + 1
            if count <= 1:
                self.totalContent=db.getdata()
                self.itemCount=db.countitems()
            else:
                data = db.getdata()
                for key in data:
                    self.totalContent[self.itemCount] = data[key]
                    self.itemCount = self.itemCount + 1
#----------------------------------------------------------
#----------------------------------------------------------
class tags_cl(object):
    exposed = True
    def __init__(self):
        self.itemCount = 0 
    #-----------------------------------------------------
    @cherrypy.tools.json_out()
    def GET(self):
        with open('./data/tags.json', 'r') as f:
            data = json.load(f)
        return data
        
    #-----------------------------------------------------
#EOF