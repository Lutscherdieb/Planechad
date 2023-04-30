import os
import os.path
import codecs
import json
import string
import base64

#----------------------------------------------------------
class Database_cl(object):
#----------------------------------------------------------

   #-------------------------------------------------------
   def __init__(self,name): 
   #-------------------------------------------------------
      self.name = name
      self.imgPath = './content/img/editions/' + name
      self.dataPath = './data/sets/' + name + '.json'
      self.planesPath = './data/sets/' + name + '_planes.json'
      self.basicPlanePath = './data/basic/plane.json'
      
      # Create planes.json and name.json from reading the filesystem
      self.fromFilesystem()
   #-------------------------------------------------------
   def countitems(self):
      return len(os.listdir(self.imgPath))
   countitems.exposed= True

   def loaddata(self):
      with open(self.dataPath, 'r') as f:
         data = json.load(f)
      return data
   loaddata.exposed= True

   def savedata(self,data):
      with open(self.dataPath, 'w') as f:
         json.dump(data,f,indent=4)
      return data
   savedata.exposed= True

   def getdata (self,id=None):
      if id == None:
         return self.loadplanedata()
      else:
         try:
            return self.loadplanedata()[id]
         except:
            raise ValueError("id not found")
   getdata.exposed= True

   def getdefaultplane(self):
      with open(self.basicPlanePath, 'r') as f:
         data = json.load(f)
      return data["plane"]
   getdefaultplane.exposed= True

   def loadplanedata(self):
      with open(self.planesPath, 'r') as f:
         data = json.load(f)
      return data
   loadplanedata.exposed= True

   def saveplanedata(self,data):
      with open(self.planesPath, 'w') as f:
         json.dump(data,f,indent=4)
      return data
   saveplanedata.exposed= True

   def updateplanedata(self,data,id):
      tmp= self.loadplanedata()
      tmp[id] = data
      self.saveplanedata(tmp)
      return
   updateplanedata.exposed=True

   def fromFilesystem (self):
      emptyJSON = {}
      # create files if needed
      if not os.path.isfile(self.planesPath):
         f = open(self.planesPath, 'x')
         with open(self.planesPath, 'w') as f:
            json.dump(emptyJSON,f,indent=4)

      if not os.path.isfile(self.dataPath):
         f = open(self.dataPath, 'x')
         with open(self.dataPath, 'w') as f:
            json.dump(emptyJSON,f,indent=4)
      #toDO: read filecount of folder and write count to json
      fileCount = len(os.listdir(self.imgPath))
      data = self.loaddata()
      data["itemCount"] = fileCount
      self.savedata(data)

      dataOld = self.loadplanedata()
      count = 0
      for file in os.listdir(self.imgPath):
         filename = os.fsdecode(file)
         if str(count) in dataOld and dataOld[str(count)]['Edition'] == self.name and dataOld[str(count)]['Name'] == os.path.splitext(filename)[0] and dataOld[str(count)]['Image'] == '/img/editions/' + self.name + '/' + filename:
            data = dataOld[str(count)]
         else:
            data = self.getdefaultplane()
         data['ID'] = str(count)
         data['Name'] = os.path.splitext(filename)[0] #filename
         data['Image'] = '/img/editions/' + self.name + '/' + filename
         data['Edition'] = self.name
         #data['Rating'] = [0,0,0]

         self.updateplanedata(data,str(count))
         count = count + 1 
      
      return

# EOF