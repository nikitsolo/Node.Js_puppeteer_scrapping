# Puppeteer Web-Scrapping

## Beschreibung des Projekts
Dieses Projekt hat zum Ziel möglichst viele Job-Angebote mithilfe eines Web-Scrappers zu sammeln.
Zur Verwendung kam das Node.js Framework "Puppeteer". 
Der WebScrapper geht durch 3 ausgewählte Seiten (Indeed, Stepstone, Glassdoor) und transformiert die Stellenanzeigen (Dirty-API) und speichert 
diese in einer MySQL Datenbank ab.

## Motivation für das Projekt
Da zum Zeitpunkt der Idee (Ende 2019) ich mich langsam um interessante Berufsbereiche (BI, Data Science, etc.) und attraktive Arbeitgeber umgeschaut habe, 
hatte ich ein wenig Erfahrung mit den abgesuchten Seiten. Meiner Erfahrung nach waren die Suchalgorithmen der Webseiten etwas ineffektiv, und inspieriert durch das bekanntes Data Mining Video [SpiegelMining – Reverse Engineering von Spiegel-Online (33c3)](https://www.youtube.com/watch?v=-YpwsdRKt8Q&t=1109s "SpiegelMining – Reverse Engineering von Spiegel-Online (33c3)"), beschloss Ich daraus meinen ersten Scrapper zu bauen. 

## Data Cleaning

Änderung aller Städte in ein einheitliches zBs Frankfurt, Frankfurt a.M., Nähe Frankfurt, Raum Frankfurt zu Frankfurt am Main

Änderung aller Umlaute, zB. ä zu ae

## Ergebnis
Webseiten: 'Indeed', 'Stepstone', 'Glassdoor'

Städte: 'Frankfurt', 'Wiesbaden', 'Mainz', 'Wien', 'München', 'Bochum', 'Stuttgart', 'Hamburg', 'Köln', 'Berlin'

Schlagwörter: 'IT Junior', 'IT Trainee', 'Data Junior', 'Data Trainee', 'BI Junior', 'BI Trainee', 'KI Junior', 'KI Trainee'

=240 Kombinationen aus Städten Berufsfeldern und Webseiten zum Scrappen

Mein Scrapper ist über einen Zeitraum von ca 6 Monaten (Leider nicht regelmäßig) mit 240 verschiedenen Kombinationen gestartet worden.
Es wurden ca 35.000 Stellenangebote gesammelt.

