generate-keys:
	rm -f temp.key && ssh-keygen -t rsa -b 1024 -f temp.key -N "" -q && ssh-keygen -e -f temp.key -m PKCS8 | base64 | tr "\n" " " && echo && cat temp.key | base64 | tr "\n" " " && echo
