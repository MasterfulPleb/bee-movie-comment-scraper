This script scrapes every parent comment from a starting comment (more than 20,000 comments deep) 
in the Bee Movie thread on r/AskOuija and adds relevant data-points to a pre-configured MariaDB.

https://www.reddit.com/r/AskOuija/comments/ofiegh/dam_i_forgot_the_entire_bee_movie_script_can_you/

Datapoints collected are:

    comment ID
    parent comment ID
    comment body
    author
    timestamp
    permalink(from /r/... onwards)
    is edited - boolean
    is OP - boolean
    award count

There are many more datapoints but none were relevant for my purposes.

If you want to use this script for some insane reason you're going to need to register for a script
with Reddit @ https://www.reddit.com/prefs/apps and fill out the login.json.template file with the
relevant information, then change the name to 'login.json'. You will also need a MariaDB set up on
the linux server running the sript, with a DB and table configured. You'll also probably need to tweak
a bunch of code too. I dont know how you made it here but you probably dont want to use this script
