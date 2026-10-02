# Pure-python sound design, cue-locked to index.html timings. Writes sound.wav (48k stereo).
import json, math, random, struct, wave
SR=48000; DUR=json.load(open('cues.json'))['DUR']; N=int(SR*DUR)
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

# --- cue times exported by render.mjs from reel.js
C=json.load(open('cues.json'))
T=C['T']; s2,s3,s4,s5=T['s2'],T['s3'],T['s4'],T['s5']
# Transition sounds only: soft whooshes into each move, low impacts on scene changes.
# No music bed, no beeps, no rapid tick bursts.
# --- Scene 1: intro
whoosh(0.6,0.95,.28)
boom(1.28,.6)
whoosh(s2-.8,.7,.28)
# --- Scene 2: approach
boom(s2,.5)
for s in C['SLOT']:
    whoosh(s,.45,.12,rise=False,pan=.2)
# --- Scene 3: impact
whoosh(s3-.5,.5,.35); boom(s3,.6,40)
for i in range(5):
    st=C['STAT']['first']+i*C['STAT']['dur']
    if i<4: whoosh(st+C['STAT']['dur']-.35,.35,.14,pan=.3)
# --- Scene 4: journey
whoosh(s4-.35,.35,.22); boom(s4,.4,52)
for i,tt in enumerate(C['nodes']):
    if i>0: whoosh(tt-.45,.6,.1,rise=False,pan=-.3)
# --- Scene 5: end card
whoosh(s5-.7,.75,.45)
boom(s5+.05,.75,38)
# master: soft clip + fade out
peak=max(max(abs(x) for x in L),max(abs(x) for x in R))
with wave.open('sound.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    fr=bytearray()
    for i in range(N):
        t=i/SR; f=min(1,(DUR-t)/.35)
        a=math.tanh(L[i]/peak*1.0)*.8*f; c=math.tanh(R[i]/peak*1.0)*.8*f
        fr+=struct.pack('<hh',int(a*32767),int(c*32767))
    w.writeframes(bytes(fr))
print('peak',peak)
