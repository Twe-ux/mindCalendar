import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import MindMapNode from '@/models/MindMapNode'
import CalendarEvent from '@/models/CalendarEvent'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/mindmap - Début')
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.email || 'Aucune session')
    
    if (!session?.user?.email) {
      console.log('Pas de session utilisateur valide')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('Connexion à MongoDB...')
    await dbConnect()
    console.log('MongoDB connecté avec succès')
    
    const nodes = await MindMapNode.find({ userId: session.user.email })
    console.log(`Trouvé ${nodes.length} noeuds pour l'utilisateur ${session.user.email}`)
    
    return NextResponse.json(nodes)
  } catch (error) {
    console.error('Error fetching mindmap nodes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/mindmap - Début')
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.email || 'Aucune session')
    
    if (!session?.user?.email) {
      console.log('Pas de session utilisateur valide')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Données reçues:', body)
    
    console.log('Connexion à MongoDB...')
    await dbConnect()
    console.log('MongoDB connecté avec succès')
    
    const newNode = new MindMapNode({
      ...body,
      userId: session.user.email
    })
    
    console.log('Sauvegarde du noeud:', newNode)
    await newNode.save()
    console.log('Noeud sauvegardé avec succès, ID:', newNode._id)
    
    return NextResponse.json(newNode, { status: 201 })
  } catch (error) {
    console.error('Error creating mindmap node:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    await dbConnect()
    
    const updatedNode = await MindMapNode.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      updateData,
      { new: true }
    )
    
    if (!updatedNode) {
      return NextResponse.json({ error: 'Noeud non trouvé' }, { status: 404 })
    }
    
    return NextResponse.json(updatedNode)
  } catch (error) {
    console.error('Error updating mindmap node:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    await dbConnect()
    
    const deletedNode = await MindMapNode.findOneAndDelete({
      _id: id,
      userId: session.user.email
    })
    
    if (!deletedNode) {
      return NextResponse.json({ error: 'Noeud non trouvé' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Noeud supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting mindmap node:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}