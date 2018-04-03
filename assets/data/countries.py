import json
from itertools import chain
import pycountry

country_list = [country.name for country in list(pycountry.countries)]
#country_official_names = [country.official_name if country.official_name for country in list(pycountry.countries)]
#print country_official_names

#Add official names and common names
country_official_names = []
for country in list(pycountry.countries):
    if hasattr(country, "official_name"):
        #country_official_names.append(country.official_name)
        country_list.append(country.official_name)
    if hasattr(country, "common_name"):
        country_list.append(country.common_name)   

#Add historical names
historic_names = [country.name for country in list(pycountry.historic_countries)]
country_list.extend(historic_names)
country_list.remove('United States')
country_list.remove('United States of America')
missing_countries = ['Republic of Kosovo', 'St. Vincent And The Grenadines', 
'Czech And Slovak Federal Republic', 'Union Of Soviet Socialist Republics', 'Czechoslovak Socialist Republic', 'Republic Of Korea', 
'Yugoslavia']
country_list.extend(missing_countries)
alternate_names_of_countries = {'Russian Federation': ('Russia',)}
country_quirk_name_to_normal_name = {"Czechia": "Czech Republic", "Venezuela, Bolivarian Republic of": "Venezuela", 
"Bolivia, Plurinational State of": "Bolivia", "Moldova, Republic of": "Moldova", 
"Micronesia, Federated States of": "Federated States of Micronesia", "Virgin Islands, British": "British Virgin Islands"}

treaty_to_country = {"ABM TREATY AND INTERIM AGREEMENT AND ASSOCIATED PROTOCOL": "Union Of Soviet Socialist Republics", 
"The Moscow Treaty": "Russian Federation"}


with open('treaty.json') as json_data:
    treaties = json.load(json_data)
    #print treaties[0]
    count = 0
    for treaty in treaties:
    	#print treaty['Title']
        #if any(country_name in treaty['Title'] for country_name in country_list):
        countries = []
        for country_name in country_list:
            country_lc = country_name.lower()
            if country_lc in treaty['Title'].lower():
                count+=1
                try:
                    countryobj = pycountry.countries.lookup(country_name)
                    if hasattr(countryobj, "official_name"):
                        #countries.append(country_name)
                        countries.append(countryobj.name)
                    else:
                        countries.append(country_name)
                except LookupError:
                    countries.append(country_name)        
                #print country_name
                #treaty.update({'countries', })
            if country_name in alternate_names_of_countries:
                for alternate_name in alternate_names_of_countries[country_name]:
                    if alternate_name.lower() in treaty['Title'].lower():
                        if country_name not in countries:
        				    countries.append(country_name)
                            #count+=1
        #add countries to treaties with missing country names in title 
        if treaty['Title'] in treaty_to_country:
            countries.append(treaty_to_country[treaty['Title']])	
        #print treaty['Title']        
        #print countries  

        #remove duplicates:
        countries = list(set(countries))

        #fix quirks in country names:
        for cntry in countries:
            if cntry in country_quirk_name_to_normal_name:
                countries.remove(cntry)
                countries.append(country_quirk_name_to_normal_name[cntry])

        if len(countries) > 1:
            
            #remove countries that appear more than once under different names
            for c in countries:
                all_except_for_c = set(countries) - set([c])
                #print (c, all_except_for_c)
                for c_complement in all_except_for_c:
                    if c.lower() in c_complement.lower():
                        countries.remove(c)

            if len(countries) > 1:    
                countries.append("Multilateral, International Organizations, Other")
        	    #countries.append("Multilateral, International Organizations, Other")
        	   #print countries
        if len(countries) == 1:
            print countries
            countries.append("Bilateral")

        if len(countries) == 0: 
            countries.append("Multilateral, International Organizations, Other")

        treaty['countries'] = countries   
print count 
with open('treaties_with_countries.json', 'w') as json_output_data:
	json.dump(treaties, json_output_data)
