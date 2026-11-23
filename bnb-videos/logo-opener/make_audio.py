# 2.0 s sting: soft pencil-draw swish (0.15-0.7), warm chime + low thump at the reveal (~0.62), airy tail
import numpy as np, soundfile as sf
SR=48000; n=int(SR*2.0); t=np.arange(n)/SR; out=np.zeros((n,2)); rng=np.random.default_rng(7)
def env(a,b,att,rel):
    e=np.zeros(n); i0,i1=int(a*SR),int(b*SR); x=t[i0:i1]-a
    e[i0:i1]=np.minimum(1,x/att)*np.exp(-x/rel); return e
# swish: band-ish filtered noise rising
noise=rng.standard_normal(n); k=np.ones(24)/24; sw=np.convolve(noise,k,'same')-np.convolve(noise,np.ones(240)/240,'same')
sw*=env(0.12,0.85,0.25,0.25)*0.35
# chime (bell partials) at 0.62
def bell(f0,start,amp):
    s=np.zeros(n); i=int(start*SR); x=t[i:]-start
    for r,a,d in [(1,1,1.2),(2.0,.45,.7),(2.76,.3,.5),(4.07,.15,.3)]: s[i:]+=a*np.sin(2*np.pi*f0*r*x)*np.exp(-x/d)
    return s*amp*np.minimum(1,(t-start).clip(0)/0.005)
ch=bell(587.33,0.62,0.22)+bell(880.0,0.66,0.12)+bell(1174.7,1.32,0.05)
th=np.zeros(n); i=int(0.62*SR); x=t[i:]-0.62; th[i:]=np.sin(2*np.pi*(55+40*np.exp(-x*18))*x)*np.exp(-x/0.18)*0.5
pad=np.zeros(n); x=t; pad=(np.sin(2*np.pi*146.8*x)+0.6*np.sin(2*np.pi*220*x)+0.4*np.sin(2*np.pi*293.7*x))*0.05*np.minimum(1,x/0.4)*np.clip((2.0-x)/0.5,0,1)
mono=sw+ch+th+pad
out[:,0]=mono+0.08*np.roll(ch,240); out[:,1]=mono+0.08*np.roll(ch,480)
fade=np.clip((2.0-t)/0.15,0,1); out*=fade[:,None]
out/=np.abs(out).max()/0.8
sf.write('sting.wav',out,SR)
