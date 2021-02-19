#Désactiver pour : anglais
#downlink  with security

 
import sys

import requests

import hashlib

import datetime



 

 

TPWAPIURL = "https://api-iot.gnet.tn"

#DevEUI = "004A77012404D323"

#FPort = "2"

# inetrval time mono 1 min

#Payload = "FEFEFEFE6804002810192068140E3434933735333333646464646F339916"

#On

#Payload ="FEFEFEFE68040028101920681C1035333333646464644F333434343434CC2116"

#Off

#Payload ="FEFEFEFE68040028101920681C1035333333646464644D333434343434CC1F16"

 

#DevEUI = "004A77012404D36E"

#FPort = "2"

# inetrval time tripahse  3 min

#Payload = "FEFEFEFE6834000000192068140E343493373533333364646464E7330916"

#On

#Payload ="FEFEFEFE68340000001920681C1035333333646464644F333434343434CC1916"

#Off

#Payload ="FEFEFEFE68340000001920681C1035333333646464644D333434343434CC1716"

 

DevEUI = sys.argv[1]

FPort = "1"

Payload = sys.argv[2]

 

AS_ID = "Treetronix"

#pour LRCaskey doit étre écrit en minuscule hex ici pas dans actility

LRCASKey = "22222222222222222222222222222222"

 

# I.1 - Calculate Timestamp

CurrentTime = datetime.datetime.now()

print("CurrentTime:", CurrentTime)

TimeStampSHA = CurrentTime.strftime("%Y-%m-%dT%H:%M:%S.000") + "+01:00"

TimeStampURL = TimeStampSHA.replace(":", "%3A")

TimeStampURL = TimeStampURL.replace("+", "%2B")

print("Time Stamp SHA:", TimeStampSHA)

print("Time Stamp URL:", TimeStampURL)

 

# I.2 - Calculate Token <QueryParameters><ASKey>

QueryStringSHA = "DevEUI=" + DevEUI + "&FPort=" + FPort + "&Payload=" + Payload + "&AS_ID=" + AS_ID + "&Time=" + TimeStampSHA

SHA2String = QueryStringSHA + LRCASKey

SHA2Token = hashlib.sha256(SHA2String.encode("utf-8")).hexdigest()

print(QueryStringSHA)

print(SHA2String)

print("Token = ", SHA2Token)

 

# II - Send Downlink

QueryStringURL = "DevEUI=" + DevEUI + "&FPort=" + FPort + "&Payload=" + Payload + "&AS_ID=" + AS_ID + "&Time=" + TimeStampURL

SendDownlinkURL = TPWAPIURL + "/thingpark/lrc/rest/downlink?" + QueryStringURL + "&Token=" + SHA2Token

SendDownlinkHeaders = {'Content-Type': 'application/x-www-form-urlencoded'}

SendDownlinkPayload = ""

SendDownlinkResponse = requests.request("POST",

                                           SendDownlinkURL,

                                           headers=SendDownlinkHeaders,

                                           data=SendDownlinkURL

                                           )

print("#1 - Send Downlink")

print("URL:", SendDownlinkURL)

print("Headers:", SendDownlinkHeaders)

print("Payload:", SendDownlinkPayload)

print("Response:", SendDownlinkResponse)

print("Response Text:", SendDownlinkResponse.text)

print("Cookies:", SendDownlinkResponse.cookies)

 
