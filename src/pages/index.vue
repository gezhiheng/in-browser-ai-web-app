<script setup lang="ts">
import { Mic, Sparkles } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-8">
    <div class="max-w-5xl mx-auto space-y-8">
      <div class="space-y-2">
        <h1 class="text-4xl font-bold tracking-tight">
          {{ $t('app.title') }}
        </h1>
        <p class="text-lg text-muted-foreground">
          {{ $t('app.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Confetti Demo Card -->
        <Card class="flex flex-col transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Sparkles class="h-5 w-5 text-yellow-500" />
              {{ $t('app.nav.confetti') }}
            </CardTitle>
            <CardDescription>
              {{ $t('app.confetti.desc') }}
            </CardDescription>
          </CardHeader>
          <CardContent class="flex-1">
            <p class="text-sm text-muted-foreground">
              {{ $t('app.confetti.body') }}
            </p>
          </CardContent>
          <CardFooter>
            <Button as-child class="w-full">
              <RouterLink to="/confetti">
                {{ $t('app.nav.try') }}
              </RouterLink>
            </Button>
          </CardFooter>
        </Card>

        <!-- Speech to Text Demo Card -->
        <Card class="flex flex-col transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Mic class="h-5 w-5 text-blue-500" />
              {{ $t('app.nav.speech') }}
            </CardTitle>
            <CardDescription>
              {{ $t('app.speech.desc') }}
            </CardDescription>
          </CardHeader>
          <CardContent class="flex-1">
            <p class="text-sm text-muted-foreground">
              {{ $t('app.speech.body') }}
            </p>
          </CardContent>
          <CardFooter>
            <Button as-child class="w-full">
              <RouterLink to="/speech2Text">
                {{ $t('app.nav.try') }}
              </RouterLink>
            </Button>
          </CardFooter>
        </Card>

        <!-- Placeholder for future demos -->
        <Card class="flex flex-col opacity-60 border-dashed">
          <CardHeader>
            <CardTitle>{{ $t('app.nav.coming') }}</CardTitle>
            <CardDescription>
              {{ $t('app.coming.desc') }}
            </CardDescription>
          </CardHeader>
          <CardContent class="flex-1">
            <p class="text-sm text-muted-foreground">
              {{ $t('app.coming.body') }}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" disabled class="w-full">
              {{ $t('app.coming.button') }}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
