import bpy, math, bmesh, os
from mathutils import Vector
s=bpy.context.scene
model=bpy.data.collections['VAS · model exportable']
root=bpy.data.objects['Vas_precipitats_500ml']
glass=bpy.data.objects['Vidre_amb_bec_abocador'].active_material
glass.name="Vidre transparent · compatible web"
p=next(n for n in glass.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
p.inputs['Base Color'].default_value=(.76,.9,.96,1)
p.inputs['Alpha'].default_value=.14
p.inputs['Transmission Weight'].default_value=0
p.inputs['Roughness'].default_value=.12
p.inputs['Specular IOR Level'].default_value=.32
glass.diffuse_color=(.76,.9,.96,.14)
glass.surface_render_method='BLENDED'
glass.use_backface_culling=True
if hasattr(glass,'use_transparency_overlap'):glass.use_transparency_overlap=False
# A separate liquid mesh. Only the upper vertices move; bottom and meniscus curvature stay fixed.
zmark=lambda ml:.003+ml*1e-6/(math.pi*.041**2)
rad=.0407; seg=160
radii=[0,.01,.02,.03,.035,.037,.038,.039,.0395,.040,.0403,.0405,rad]
v=[];f=[]
for r in radii:
    h=.00125*(math.exp((r-rad)/.0009)-math.exp(-rad/.0009))
    for i in range(seg):
        a=2*math.pi*i/seg
        v.append((r*math.cos(a),r*math.sin(a),zmark(100)+h))
top_count=len(v)
for ri in range(len(radii)-1):
    for i in range(seg):
        k=(i+1)%seg
        f.append((ri*seg+i,(ri+1)*seg+i,(ri+1)*seg+k,ri*seg+k))
bottom_index=len(v)
for i in range(seg):
    a=2*math.pi*i/seg;v.append((rad*math.cos(a),rad*math.sin(a),.0033))
outer=(len(radii)-1)*seg
for i in range(seg):
    k=(i+1)%seg
    f.append((outer+i,bottom_index+i,bottom_index+k,outer+k))
f.append(tuple(reversed(range(bottom_index,bottom_index+seg))))
me=bpy.data.meshes.new('Liquid_amb_menisc_concau');me.from_pydata(v,[],f);me.update()
bm=bmesh.new();bm.from_mesh(me);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-8);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free()
liquid=bpy.data.objects.new('Liquid_blau_nivell_variable',me);model.objects.link(liquid);liquid.parent=root
for poly in me.polygons:poly.use_smooth=len(poly.vertices)<seg
lm=bpy.data.materials.new('Liquid blau · contrast didactic');lm.use_nodes=True
lp=next(n for n in lm.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
lp.inputs['Base Color'].default_value=(.005,.12,.55,1)
lp.inputs['Roughness'].default_value=.17
lp.inputs['Alpha'].default_value=.88
lp.inputs['Specular IOR Level'].default_value=.25
lm.diffuse_color=(.005,.12,.55,.88);lm.surface_render_method='BLENDED';lm.use_backface_culling=True
me.materials.append(lm)
basis=liquid.shape_key_add(name='Nivell_100_ml')
key=liquid.shape_key_add(name='Nivell_500_ml')
delta=zmark(500)-zmark(100)
for i,vert in enumerate(me.vertices):
    if vert.co.z>.004:key.data[i].co.z+=delta
key.value=.5
root['nivell_ml']=300.0
root.id_properties_ui('nivell_ml').update(min=100,max=500,soft_min=100,soft_max=500,description='Nivell del fons del menisc. Escala aproximada.')
driver=key.driver_add('value').driver
driver.expression='(nivell-100)/400'
var=driver.variables.new();var.name='nivell';var.targets[0].id=root;var.targets[0].data_path='["nivell_ml"]'
liquid['mostrar_liquid']='Amaga aquest objecte per mostrar el vas buit'
liquid['nivell_min_ml']=100;liquid['nivell_max_ml']=500
liquid['web']='morphTargetInfluences[0] = (ml - 100) / 400'
root['escala']='Lectura aproximada; no es material volumetric de precisio.'
# Neutral environment and camera useful for seeing the contents.
cam=s.camera
cam.location=(.035,-.32,.145)
cam.rotation_euler=(Vector((0,0,.058))-cam.location).to_track_quat('-Z','Y').to_euler()
s.cycles.samples=48
s.cycles.transparent_max_bounces=16
s.render.resolution_percentage=80
out=r'D:\77 - Intermunicipal\Curs 2025-2026\blender\estris-laboratori\vas-de-precipitats\vas-de-precipitats_500ml'
s.render.filepath=os.path.join(out,'vas-de-precipitats_500ml-amb-liquid-blau-300-ml.png')
for screen in bpy.data.screens:
    for ar in screen.areas:
        if ar.type=='VIEW_3D':
            ar.spaces.active.shading.type='MATERIAL'
            ar.spaces.active.shading.use_scene_world=True
            ar.spaces.active.shading.use_scene_lights=True
            ar.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
            ar.spaces.active.region_3d.view_location=(0,0,.058)
            ar.spaces.active.region_3d.view_distance=.23
bpy.context.view_layer.update()
bpy.ops.object.select_all(action='DESELECT')
liquid.select_set(True);bpy.context.view_layer.objects.active=liquid
def render_transparency_check():
    bpy.ops.render.render(write_still=True)
    return None
bpy.app.timers.register(render_transparency_check,first_interval=.2)
print('Transparent glass and adjustable concave meniscus created')
