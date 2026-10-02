# Pure-python sound design, cue-locked to index.html timings. Writes sound.wav (48k stereo).
import math, random, struct, wave
SR=48000; DUR=15.0; N=int(SR*DUR)
L=[0.0]*N; R=[0.0]*N
rnd=random.Random(3)
def add(t0,fn,length,gain=1.0,pan=0.0):
    i0=int(t0*SR)
    gl=gain*math.cos((pan+1)*math.pi/4); gr=gain*math.sin((pan+1)*math.pi/4)
    for k in range(int(length*SR)):
        i=i0+k
        if 0<=i<N:
            v=fn(k/SR); L[i]+=v*gl; R[i]+=v*gr
def boom(t0,g=1.0,f0=46):   # sub impact
    add(t0,lambda t: math.sin(2*math.pi*(f0*t+90/28*(1-math.exp(-28*t))))*math.exp(-3.2*t),1.6,g)
def kick(t0,g=.5):
    add(t0,lambda t: math.sin(2*math.pi*(52*t+140/34*(1-math.exp(-34*t))))*math.exp(-9*t),.5,g)
def blip(t0,f=1320,g=.18,pan=0):
    add(t0,lambda t: math.sin(2*math.pi*f*t)*math.exp(-28*t),.25,g,pan)
def tick(t0,g=.12,pan=0):
    st={'y':0}
    def fn(t):
        n=rnd.uniform(-1,1); y=n-st['y']; st['y']=n  # differentiated noise = bright click
        return y*math.exp(-180*t)
    add(t0,fn,.05,g,pan)
def whoosh(t0,length,g=.35,rise=True,pan=0):
    st={'lp':0.0}
    def fn(t):
        x=t/length
        env=(x**2.2 if rise else (1-x)**2.2)*math.sin(math.pi*min(1,x*1.05))**.3 if 0<x<1 else 0
        cut=.02+.35*(x if rise else 1-x)
        st['lp']+=cut*(rnd.uniform(-1,1)-st['lp'])
        return st['lp']*env*3
    add(t0,fn,length,g,pan)
def hat(t0,g=.06):
    st={'p':0}
    def fn(t):
        n=rnd.uniform(-1,1); y=n-st['p']; st['p']=n; return y*math.exp(-60*t)
    add(t0,fn,.08,g,.3)
def pad(t0,t1,freqs,g=.05):
    def fn(t):
        T=t1-t0; env=min(1,t/1.2)*min(1,(T-t)/1.5)
        return env*sum(math.sin(2*math.pi*f*t+math.sin(2*math.pi*.3*t)*.6)/len(freqs) for f in freqs)
    add(t0,fn,t1-t0,g)

# --- Scene 1
blip(0.08,880,.25); boom(0.1,.35,60)
whoosh(0.45,0.75,.3)
boom(0.98,.95); blip(0.98,1760,.08,-.4); blip(1.14,1318,.08,.4)
for k in range(13): tick(1.5+k*.042,.07,-.5)
for k in range(8): tick(1.7+k*.05,.05,.5)
whoosh(2.3,.55,.3,rise=True)
# --- Scene 2
boom(2.95,.8); kick(2.95,.5)
for s in [3.35,3.72,4.09,4.46]:
    whoosh(s,.3,.18,rise=False,pan=.2); tick(s+.17,.14)
blip(4.8,1975,.16); blip(4.8,1318,.12)
# --- beat bed 2.95 -> 12.5 (120bpm)
b=2.95
while b<12.4:
    kick(b,.38)
    hat(b+.25,.05)
    b+=.5
pad(2.9,12.8,[110,164.8,220,277.2],.06)
# --- Scene 3
whoosh(5.15,.45,.4); boom(5.55,1.0,40)
for i in range(4):
    st=5.67+i*.94
    blip(st,[1046,1175,1318,1568][i],.14)
    for k in range(10): tick(st+.02+k*.055*(1+k*.12),.06,(k%2)*.6-.3)
    if i<3: whoosh(st+.7,.27,.16,pan=.3)
# --- Scene 4
whoosh(9.2,.3,.25); boom(9.45,.6,52)
def cubic_inv(y):
    lo,hi=0,1
    for _ in range(40):
        m=(lo+hi)/2; v=4*m**3 if m<.5 else 1-(-2*m+2)**3/2
        lo,hi=(m,hi) if v<y else (lo,m)
    return m
for i,nx in enumerate([300+i*560 for i in range(7)]):
    pn=(nx-1060)/2700
    tt=9.75 if pn<=0 else 9.6+cubic_inv(pn)*(12.5-9.6)
    if i==1: tt=9.85
    blip(tt+.05,[659,784,880,988,1175,1318,1568][i],.12,-.6+i*.2); tick(tt+.05,.08)
# --- Scene 5
whoosh(11.9,.65,.55)
boom(12.6,1.2,38); kick(12.6,.6)
pad(12.6,15.0,[220,277.2,329.6,440,554.4],.07)
blip(13.0,1760,.08); blip(13.15,2093,.06)
for k in range(10): tick(13.5+k*.04,.05,-.4)
blip(14.2,880,.1)
# master: soft clip + fade out
peak=max(max(abs(x) for x in L),max(abs(x) for x in R))
with wave.open('sound.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    fr=bytearray()
    for i in range(N):
        t=i/SR; f=min(1,(DUR-t)/.35)
        a=math.tanh(L[i]/peak*1.6)*.85*f; c=math.tanh(R[i]/peak*1.6)*.85*f
        fr+=struct.pack('<hh',int(a*32767),int(c*32767))
    w.writeframes(bytes(fr))
print('peak',peak)
