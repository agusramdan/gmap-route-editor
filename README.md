


https://www.google.com/maps/dir/?api=1&origin=Paris%2CFrance&destination=Cherbourg%2CFrance&travelmode=driving&waypoints=Versailles%2CFrance%7CChartres%2CFrance%7CLe+Mans%2CFrance%7CCaen%2CFrance

akan di convert mentjadi


https://www.google.com/maps/dir/Paris,+France/Versailles,+78000,+France/Chartres,+28000,+France/Le+Mans,+France/Caen,+14000,+France/Cherbourg-en-Cotentin,+France/@48.7971843,-1.8292907,7z/data=!3m1!4b1!4m38!4m37!1m5!1m1!1s0x47e66e1f06e2b70f:0x40b82c3688c9460!2m2!1d2.3522219!2d48.856614!1m5!1m1!1s0x47e67db475f420bd:0x869e00ad0d844aba!2m2!1d2.130122!2d48.801408!1m5!1m1!1s0x47e40c4424f1e18b:0x7863884853c7ed29!2m2!1d1.489012!2d48.443854!1m5!1m1!1s0x47e288d214f3aa31:0x69025d4c6a7de07f!2m2!1d0.199556!2d48.00611!1m5!1m1!1s0x480a42bd4c04c933:0x3da5749f30d00859!2m2!1d-0.370679!2d49.182863!1m5!1m1!1s0x480c97121faa62e1:0x7ec61fc418bcf800!2m2!1d-1.622224!2d49.6338979!3e0



telihat menjadi 

https://www.google.com/maps/dir/{waypoints}/{@ centralmap}/{data=}

issue berikutnya adalah bagaimana untuk melakukan extraksi data.

Ada penelitian yang menberikan infomrasi terkait edcoding data berdasarkan google encode
https://medium.com/@supun1001/how-to-generate-google-embed-links-programmatically-for-iframes-for-routes-only-d6dc225e59e8


The URL design
Berdaarkan informasi dari 
https://stackoverflow.com/questions/47017387/decoding-the-google-maps-embedded-parameters

```
m: matrix
f: float
d: double
i: integer
b: boolean
e: enum (as integer)
s: string
u: unsigned int
```

FTID ke location

way over Google:

https://google.com/maps?ftid=0xd62377123a70817:0x85e89b65fcf7c648

akan menjadi 


https://www.google.com/maps/place/C.+Cruz+de+Piedra,+4,+03015+Alicante+(Alacant),+Alicante,+Spanyol/@38.3642128,-0.4620302,17z/data=!3m1!4b1!4m5!3m4!1s0xd62377123a70817:0x85e89b65fcf7c648!8m2!3d38.3642128!4d-0.4620302


