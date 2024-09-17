defaultDomain="www.cosmicrms.com/api"

# read -p "Enter the domain name (Press Enter for default $defaultDomain): " domainName


productionEnv="VITE_REACT_APP_API_URL='http://$defaultDomain/' \\nVITE_REACT_APP_SOCKET_URL='WS://$defaultDomain/ws/v1/'"

developmentEnv=`cat .env`
echo -e "$productionEnv" > .env
#sed -i '/host:{/,/}/c\'"$replacement" dist/index.html
npm i -f
START=$(date +%s)
npm run build 
END=$(date +%s)
 
echo "Build process has completed in $((END - START)) sec."

echo "$developmentEnv" > .env

rm -rf /srv/www/ui2
cp -R $PWD/dist/ /srv/www/ui2

echo "Ui deploayed successfully!!"
