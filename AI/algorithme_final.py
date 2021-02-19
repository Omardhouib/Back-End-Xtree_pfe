import pickle
import numpy as np

#données du méteo pour une semaine
meteo=[{"air_temp":[0]*24,"UV":[0]*24,"air_humidity":[0]*24,"soil_temp":[0]*24},
       {"air_temp":[0]*24,"UV":[0]*24,"air_humidity":[0]*24,"soil_temp":[0]*24},
       {"air_temp":[0]*24,"UV":[0]*24,"air_humidity":[0]*24,"soil_temp":[0]*24},
       {"air_temp":[0]*24,"UV":[0]*24,"air_humidity":[0]*24,"soil_temp":[0]*24},
       {"air_temp":[0]*24,"UV":[0]*24,"air_humidity":[0]*24,"soil_temp":[0]*24},
       {"air_temp":[0]*24,"UV":[0]*24,"air_humidity":[0]*24,"soil_temp":[0]*24},
       {"air_temp":[0]*24,"UV":[0]*24,"air_humidity":[0]*24,"soil_temp":[0]*24}]
date_irrigation=27
date_auj=20

#choose THmin & THmax
THmin=10
THmax=20

#choose a mode (0 if manual, 1 if auto)
mode=1

def Rsm(p):
    model=pickle.load(open(r'machine_learnin_model.sav', 'rb'))
    minimums=[]
    for i in range(p):
        prediction=model.predict(np.asarray([meteo[i]["air_temp"],meteo[i]["UV"],meteo[i]["air_humidity"],meteo[i]["soil_temp"]]).reshape(24,2))
        minimums.append(min(prediction))
    SMD_sum=0
    for i in range(1,len(minimums)):
        SMD_sum+=minimums[i]-minimums[i-1]
    return(SMD_sum)

def Csm_read():
    #collect data from sensor
    return 1

def next_prec():
    #gives next date of precipitation
    return 1

if mode==1:
    #lire l'humidité du sol actuelle
    Csm= Csm_read() #"fonction qui retourne la valeur de l'humidité"
    if Csm<THmin:
        f=next_prec() #"fonction qui retourne la date de précipitation la plus proche"
        if f<6:
            THmax=min(THmin+Rsm(f),THmax)
        if f>6:
            THmax=min(THmin+Rsm(6),THmax)
        while(THmax>Csm_read()):
            relay=1
        relay=0
    else:
        relay=0
else:
    if date_auj>=date_irrigation:
        while(THmax>Csm_read()):
            relay=1
        relay=0
    else:
        relay=0               
