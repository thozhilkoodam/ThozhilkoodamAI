'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Users, Target, Eye } from 'lucide-react'

export default function About() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold">About Thozhil Koodam</h1>
            <p className="mt-6 text-lg text-muted-foreground">
              We are on a mission to transform recruitment in India by providing
              enterprise-grade technology to businesses of all sizes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            <Card>
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Our Vision</h3>
                <p className="mt-2 text-muted-foreground">
                  To become India&apos;s most trusted recruitment technology platform,
                  empowering every business to hire the best talent efficiently.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Our Mission</h3>
                <p className="mt-2 text-muted-foreground">
                  Democratize access to advanced recruitment tools and AI-powered
                  features for businesses across India.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center">Our Values</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { icon: Shield, title: 'Trust & Security', desc: 'Your data is protected with enterprise-grade security and compliance.' },
                { icon: Users, title: 'Customer First', desc: 'We prioritize our customers needs and provide exceptional support.' },
                { icon: Target, title: 'Innovation', desc: 'Continuous improvement and AI-powered features to stay ahead.' },
              ].map((value) => (
                <Card key={value.title}>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{value.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
