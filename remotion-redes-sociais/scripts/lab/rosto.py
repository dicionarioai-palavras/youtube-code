import cv2, json, sys
src=sys.argv[1]; cap=cv2.VideoCapture(src); fps=cap.get(cv2.CAP_PROP_FPS); n=int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
d=cv2.data.haarcascades; F=cv2.CascadeClassifier(d+'haarcascade_frontalface_default.xml'); P=cv2.CascadeClassifier(d+'haarcascade_profileface.xml')
out=[]; step=int(fps/2)
for i in range(0,n,step):
    cap.set(cv2.CAP_PROP_POS_FRAMES,i); ok,fr=cap.read()
    if not ok: break
    H0,W0=fr.shape[:2]; W=540; Hh=int(H0*W/W0); g=cv2.cvtColor(cv2.resize(fr,(W,Hh)),cv2.COLOR_BGR2GRAY)
    cands=[]
    for c,flip in [(F,False),(P,False),(P,True)]:
        im=cv2.flip(g,1) if flip else g
        for (x,y,w,h) in c.detectMultiScale(im,1.1,5,minSize=(40,40)):
            cx=(W-(x+w/2)) if flip else x+w/2; cands.append((w*h,cx/W,(y+h/2)/Hh))
    if cands: a,cx,cy=max(cands); out.append([round(i/fps,2),round(cx,3),round(cy,3)])
print(len(out), out[:8]); json.dump(out,open(sys.argv[2],'w'))
