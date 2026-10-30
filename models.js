export const assetBasePath = new URL('.', import.meta.url).pathname.replace(/\/$/, '')

export const models = [
  {
    path: assetBasePath + '/models/Cat.glb',
    position: [0, 0, 0],
    scale: 30,
    visible: true,
    price: 666
  },

  {
    group: 'food',
    path: assetBasePath + '/models/Watermelon.glb',
    position: [0, 2, 9],
    rotation: [0, Math.PI / 2 - Math.PI / 9, 0],
    scale: 7,
    visible: true,
    price: 4
  },
  {
    group: 'food',
    path: assetBasePath + '/models/Juice.glb',
    position: [0, 2, 8.5],
    rotation: [0, Math.PI * 1.3, 0],
    scale: 2,
    price: 2
  },
  {
    group: 'food',
    path: assetBasePath + '/models/Water.glb',
    position: [0, -0.3, 8.5],
    rotation: [0, Math.PI * -0.1, 0],
    scale: 5,
    price: 1
  },
  {
    group: 'food',
    path: assetBasePath + '/models/Money.glb',
    position: [0, -0.2, 9],
    rotation: [0, 0, 0],
    scale: 0.3,
    price: 3
  },
  {
    group: 'food',
    path: assetBasePath + '/models/Orange.glb',
    position: [0, 2, 9],
    rotation: [0, 0, 0],
    scale: 0.05,
    price: 2
  },

  {
    group: 'face',
    path: assetBasePath + '/models/Glasses.glb',
    position: [-0.75, 8.4, 7.95],
    scale: 4.1,
    rotation: [0, -Math.PI / 7, 0],
    colorable: true,
    colorMaterials: ['frame', 'frame_grad', 'frame_grad2'],
    color: '#2c2a31',
    price: -1
  },
  {
    group: 'face',
    path: assetBasePath + '/models/Monocle.glb',
    position: [0.1, 0.1, 6.4],
    scale: 0.8,
    rotation: [0, -Math.PI / 7, 0],
    price: 4
  },
  {
    group: 'face',
    path: assetBasePath + '/models/Bowtie.glb',
    position: [0, 5, 5.9],
    rotation: [0, -Math.PI * 0.09, 0],
    scale: 0.008,
    price: 2
  },
  {
    group: 'face',
    path: assetBasePath + '/models/Thug Life.glb',
    position: [0, 0, 5.9],
    rotation: [0, Math.PI * 0.4, 0],
    scale: [1, 0.8, 1],
    price: 3
  },

  {
    group: 'hat',
    path: assetBasePath + '/models/Propeller Hat.glb',
    position: [0.5, 9.5, 6],
    scale: 1.7,
    rotation: [0, -Math.PI / 7, 0],
    visible: true,
    price: 2
  },
  {
    group: 'hat',
    path: assetBasePath + '/models/Hat.glb',
    position: [0.5, 8.8, 5.7],
    scale: 1.9,
    rotation: [-Math.PI * 0.05, -Math.PI / 7, -Math.PI * 0.05],
    colorable: true,
    colorMeshes: ['Cube_0'],
    color: '#6e6ce3',
    price: -5
  },
  {
    group: 'hat',
    path: assetBasePath + '/models/Duck.glb',
    position: [0.5, 10.25, 6],
    scale: 1,
    rotation: [0, -Math.PI / 7, 0],
    colorable: true,
    colorMaterials: ['Yellow'],
    color: '#ffda33',
    price: 5
  },
  {
    group: 'hat',
    path: assetBasePath + '/models/Frog.glb',
    position: [0.5, 10.7, 6],
    scale: 0.2,
    rotation: [0, -Math.PI / 7, 0],
    colorable: true,
    colorMode: 'tint',
    color: '#8fff9e',
    price: 4
  },
  {
    group: 'hat',
    path: assetBasePath + '/models/Witch Hat.glb',
    position: [0.5, 14.5, 6],
    scale: 10,
    rotation: [0, Math.PI * 0.3, 0],
    price: 2
  },

  {
    group: 'scene',
    path: assetBasePath + '/models/Bed.glb',
    position: [0, -5.5, 1],
    rotation: [0, 0, 0],
    scale: 10,
    price: 3
  },
  {
    group: 'scene',
    path: assetBasePath + '/models/Classroom.glb',
    position: [8, -33.5, -5],
    rotation: [0, -Math.PI * 0.1, 0],
    scale: 10,
    price: 1
  },
  {
    group: 'scene',
    path: assetBasePath + '/models/Tea Room.glb',
    position: [8, -16.2, -5],
    rotation: [0, -Math.PI * 0.4, 0],
    scale: 0.5,
    price: 2
  },

  {
    group: 'food',
    path: assetBasePath + '/models/Maxwell.glb',
    position: [0, 0, 9],
    rotation: [0, -Math.PI * 0.2, 0],
    scale: 10,
    price: 666
  },

  {
    path: assetBasePath + '/models/Sword.glb',
    position: [-11, 5, 8],
    rotation: [-Math.PI * 0.35, Math.PI * 0.9, Math.PI * 0.5],
    scale: 10,
    price: 10
  }
]
