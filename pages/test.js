import { useState } from 'react'
import AppShellSimple from '../components/Layout/AppShellSimple'

export default function TestPage() {
  return (
    <AppShellSimple>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-crypto-ring mb-4">Test Page</h1>
        <p className="text-crypto-text">This is a test to verify the basic layout works.</p>
        <div className="mt-4 p-4 glass-panel border-crypto-border rounded-lg">
          <p className="text-crypto-text-muted">Glass panel test</p>
        </div>
      </div>
    </AppShellSimple>
  )
}
