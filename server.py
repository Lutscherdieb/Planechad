#coding: utf-8
import os
import urllib
import os
import cherrypy
from app import application
import json

def CORS():
    cherrypy.response.headers["Access-Control-Allow-Origin"] = "http://localhost"

if __name__ == '__main__':
    conf = {
        '/': {
            #Method dispatcher festlegen
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.CORS.on': True,
        }
    }
    static_conf = {
        '/': {
            'tools.staticdir.root': os.path.dirname(os.path.abspath(__file__)),
            'tools.staticdir.on': True,
            'tools.staticdir.dir': './content',
            'tools.staticdir.index': 'index.html',
            'tools.gzip.on'         : True  
        }
    }
    path   = os.path.abspath(os.path.dirname(__file__))
    #CORS tool kann den server reloaden wenn sich die relevanten files ändert
    cherrypy.tools.CORS = cherrypy.Tool('before_handler', CORS)
    #Method-Dispatcher Klassen mounten
    cherrypy.tree.mount(application.plane_cl(), '/plane', config=conf)
    cherrypy.tree.mount(application.tags_cl(), '/tags', config=conf)
    #mounten der index.html als root auf '/'
    cherrypy.tree.mount(None, '', config=static_conf)
    #engine start
    cherrypy.engine.start()
    cherrypy.engine.block()

