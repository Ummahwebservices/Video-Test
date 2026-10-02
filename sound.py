# Pure-python sound design, cue-locked to index.html timings. Writes sound.wav (48k stereo).
import math, random, struct, wave
SR=48000; DUR=25.0; N=int(SR*DUR)
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

# --- Scene 1: intro
blip(0.12,880,.25); boom(0.12,.35,60)
whoosh(0.6,0.95,.3)
boom(1.28,.95); blip(1.28,1760,.08,-.4); blip(1.48,1318,.08,.4)
for k in range(13): tick(2.0+k*.054,.07,-.5)
for k in range(7): tick(2.3+k*.07,.05,.5)
whoosh(3.15,.7,.3)
# --- Scene 2: approach
boom(3.95,.8); kick(3.95,.5)
for s in [4.75,5.3,5.85,6.4]:
    whoosh(s,.4,.18,rise=False,pan=.2); tick(s+.21,.14)
blip(6.85,1975,.16); blip(6.85,1318,.12)
# --- beat bed (100bpm) 3.95 -> 21.6
b=3.95
while b<21.5:
    kick(b,.34); hat(b+.3,.045); b+=.6
pad(3.9,21.9,[110,164.8,220,277.2],.06)
# --- Scene 3: impact
whoosh(7.5,.5,.4); boom(8.0,1.0,40)
for i in range(5):
    st=8.15+i*1.7
    blip(st,[1046,1175,1318,1568,1760][i],.14)
    for k in range(12): tick(st+.02+k*.07*(1+k*.1),.06,(k%2)*.6-.3)
    if i<4: whoosh(st+1.35,.35,.16,pan=.3)
# --- Scene 4: journey
whoosh(16.4,.35,.25); boom(16.75,.6,52)
def cubic_inv(y):
    lo,hi=0,1
    for _ in range(40):
        m=(lo+hi)/2; v=4*m**3 if m<.5 else 1-(-2*m+2)**3/2
        lo,hi=(m,hi) if v<y else (lo,m)
    return m
s4,s5=16.75,21.7; endX=300+6*700-960
for i in range(7):
    nx=300+i*700; pn=(nx-1060)/endX
    tt=s4+.4 if pn<=0 else s4+.2+cubic_inv(pn)*(s5-1.05-s4)
    if i==1: tt=s4+.55
    blip(tt+.05,[659,784,880,988,1175,1318,1568][i],.12,-.6+i*.2); tick(tt+.05,.08)
# --- Scene 5: end card
whoosh(21.0,.75,.55)
boom(21.75,1.2,38); kick(21.75,.6)
pad(21.75,25.0,[220,277.2,329.6,440,554.4],.07)
blip(22.3,1760,.08); blip(22.5,2093,.06)
for k in range(10): tick(23.0+k*.045,.05,-.4)
blip(23.8,880,.1)
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
