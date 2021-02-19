!pip3 install pandas
 # -*-coding:Latin-1 -*
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.svm import SVR
import pickle

#lire base de données
data_base = pd.read_csv(r"AI.csv")
X = np.asarray(data_base[['air_temp', 'uv', 'air_humidity', 'soil_temp']])
t = data_base['y'].astype('int')
y = np.asarray(t)

#split between train and test
X_train, X_test, y_train, y_test = train_test_split( X, y, test_size=0.2, random_state=4)
print ('dimension Train set = ', X_train.shape,  y_train.shape)
print ('dimension Test set = ', X_test.shape,  y_test.shape)

#train+test
model = SVR()
model.fit(X_train, y_train)
print("précision du modèle "+ str(model.score(X_test,y_test)))

#enregistrer le modèle dans le pc
pickle.dump(model,open(r'machine_learnin_model.sav', 'wb'))
#re télécharger le modèle 
model=pickle.load(open(r'machine_learnin_model.sav', 'rb'))

#prédire humidité
yhat = model.predict([[2.5,3.5]])
print("soil moisture pour la température et UV donnés est = "+str(round(yhat[0],3)))
