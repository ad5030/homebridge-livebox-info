#!/bin/sh
#-------------------------------------------------------------------
#~ @(#) Name : homebridge-livebox-info.sh
#~ @(#) Desc : Persist in file the livebox sys infrmation needed by "homebridge-livebox-info" Homebridge/HomeKit plugin
#~ @(#) version : 1.0
# Auteur : adm@di-marco.net
# Date : 2019-09-28
#-------------------------------------------------------------------
# Version history
#   v1.O - Initial version - Test and work on : mac mini (late 2014) 10.13.6 (High Sierra) & livebox v4
#-------------------------------------------------------------------
#~ Usage : homebridge-livebox-info.sh
#-------------------------------------------------------------------

DIR=$(dirname $0)
TMP_DIR=/tmp
TMP_DSLRATE=_homebridge-livebox-dslrate.tmp
TMP_PHONESTATE=_homebridge-livebox-phonestate.tmp
TMP_TVSTATE=_homebridge-livebox-tvstate.tmp
TMP_WIFISTATE=_homebridge-livebox-wifistate.tmp
JSON_DATA_FILE=$TMP_DIR/_homebridge-livebox-info.json # path of .json respons file 

function livebox_mon()
{
  $DIR/lbx_sysbus.py -dslrate > $TMP_DIR/$TMP_DSLRATE
  $DIR/lbx_sysbus.py -info >> $TMP_DIR/$TMP_DSLRATE
  $DIR/lbx_sysbus.py -phonestate > $TMP_DIR/$TMP_PHONESTATE
  $DIR/lbx_sysbus.py -tvstate > $TMP_DIR/$TMP_TVSTATE
  $DIR/lbx_sysbus.py -wifistate > $TMP_DIR/$TMP_WIFISTATE
  
  _time=`date`
  
  response=null
  key=null
  value=null
  response='{"updateTime":"'${_time}'",'

  while read line; do
    read -a fields <<< $line ;
    key=${line/%: *} ; key=$(echo "$key" | perl -pe 's/^ *| *$//g') 
    value=${line#*\:} ; value=${value:1} ; value=$(echo "$value" | perl -pe 's/^ *| *$//g') 
    if [[ "${key}" == "Upstream" || "${key}" == "Downstream" ]]
    then
      value=${value% *}
    fi
    if [ "${key}" == "UpTime" ]
    then
      value=${value% (*} ; value=${value// /}
    fi
    response=${response}\"${key}\":\"${value}\",
  done < $TMP_DIR/$TMP_DSLRATE
  
  response=${response%?}

  phonestate=`cat $TMP_DIR/$TMP_PHONESTATE | grep "'status'" | grep -v "{'status':"`
  phonestate=${phonestate#*\'status\':} ; phonestate=${phonestate// /} ; phonestate=${phonestate//\'/} ; phonestate=${phonestate/%,}

  tvstate=`cat $TMP_DIR/$TMP_TVSTATE | grep "'IPTVStatus'"`
  tvstate=${tvstate#*\'IPTVStatus\':} ; tvstate=${tvstate// /} ; tvstate=${tvstate%\},*} ; tvstate=${tvstate//\'/} 

  wifistate=`cat $TMP_DIR/$TMP_WIFISTATE | grep "'Status'"`
  wifistate=${wifistate#*\'Status\':} ; wifistate=${wifistate// /} ; wifistate=${wifistate//\'/} ; wifistate=${wifistate//\}/}

  response=${response%?}\",\"PhoneState\":\"$phonestate\",\"TVState\":\"$tvstate\",\"WifiState\":\"$wifistate\"}
  echo $response > $JSON_DATA_FILE
}

livebox_mon