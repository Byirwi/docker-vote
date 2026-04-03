# Use official python runtime base image
FROM python

# Set the container application directory to /app
WORKDIR /app

# ~~~ Installation des sources ~~~
# Copy our code from the current folder to /app inside the containe
COPY . /app

# ~~~ Installation des dépendances ~~~
# Add requirements.txt to container folder /app/requirements.txt 
# Execute pip install -r requirements.txt
RUN pip install -r requirements.txt

# ~~~ Exécution de l'application ~~~
# Make port 80 available for links and/or publish
EXPOSE 80

# Define the command to be run when launching the container : `python app.py`
CMD ["python", "app.py"]