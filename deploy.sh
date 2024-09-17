# cd /home/rms/Documents/Rajani/test/workspace/ui


defaultDomain="www.cosmicrms.com/api"

# read -p "Enter the domain name (Press Enter for default $defaultDomain): " domainName


productionEnv="VITE_REACT_APP_API_URL='http://$defaultDomain/' \\nVITE_REACT_APP_SOCKET_URL='WS://$defaultDomain/ws/v1/'"

developmentEnv=`cat .env`
echo -e "$productionEnv" > .env
#sed -i '/host:{/,/}/c\'"$replacement" dist/index.html

npm run build > /dev/null 2>&1 &

START=$(date +%s)
while ps -p $! >/dev/null; do
    for i in '-' '\\' '|' '/'; do
        echo -ne "\rBuilding react app.. $i"
        sleep 0.1;
    done
done
END=$(date +%s)

echo ""
tput cuu1; tput el  # Move cursor up one line, clear to end of line
echo "Build process has completed in $((END - START)) sec."

echo "$developmentEnv" > .env

rm -rf /srv/www/ui
cp -R $PWD/dist/ /srv/www/ui

echo "Ui deploayed successfully!!"
