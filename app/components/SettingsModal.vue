<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="px-8 py-7 bg-white dark:bg-neutral-900 overflow-hidden">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-settings-2" class="text-xl text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-neutral-900 dark:text-white leading-none">Settings</h2>
              <p class="text-[12px] text-neutral-500 dark:text-neutral-500 mt-1">Personalize your chat experience</p>
            </div>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            class="rounded-xl"
            @click="isOpen = false"
          />
        </div>

        <div class="space-y-8">
          <!-- appearance -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="text-sm text-neutral-400" />
              <label class="text-[13px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                Appearance
              </label>
            </div>
            
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="option in themeOptions"
                :key="option.value"
                class="flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all group relative overflow-hidden"
                :class="
                  colorMode.preference === option.value
                    ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10'
                    : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30 font-medium text-neutral-500 dark:text-neutral-400'
                "
                @click="colorMode.preference = option.value"
              >
                <UIcon :name="option.icon" class="text-xl" :class="colorMode.preference === option.value ? 'text-primary-500' : ''" />
                <span class="text-[13px] font-semibold" :class="colorMode.preference === option.value ? 'text-primary-600 dark:text-primary-400' : ''">{{ option.label }}</span>
                <div v-if="colorMode.preference === option.value" class="absolute top-2 right-2 flex w-2 h-2 rounded-full bg-primary-500" />
              </button>
            </div>

            <div class="flex gap-4 px-1 py-1">
              <button
                v-for="color in accentColors"
                :key="color.name"
                class="w-8 h-8 rounded-full transition-all hover:scale-125 ring-offset-4 ring-offset-white dark:ring-offset-neutral-900 border-2 border-white dark:border-neutral-800 shadow-sm"
                :class="[
                  color.class,
                  selectedAccent === color.name ? 'ring-2 ring-primary-500 scale-110 shadow-lg' : 'hover:shadow-md'
                ]"
                :title="color.name"
                @click="setAccentColor(color.name)"
              />
            </div>
          </div>

          <!-- advanced -->
          <div class="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-cog" class="text-sm text-neutral-400" />
              <label class="text-[13px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                Advanced Features
              </label>
            </div>

            <div class="space-y-3">
              <!-- Compact Mode -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
                    <UIcon name="i-lucide-layout-list" class="text-neutral-500" />
                  </div>
                  <div>
                    <p class="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200">Compact Sidebar</p>
                    <p class="text-[11px] text-neutral-500">More chats in view</p>
                  </div>
                </div>
                <USwitch v-model="isCompact" />
              </div>

              <!-- Font Size -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
                    <UIcon name="i-lucide-type" class="text-neutral-500" />
                  </div>
                  <div>
                    <p class="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200">Message Font Size</p>
                    <p class="text-[11px] text-neutral-500">Current: {{ fontSize }}px</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-lg p-1 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                   <button @click="fontSize = Math.max(12, fontSize - 1)" class="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors">
                     <UIcon name="i-lucide-minus" class="text-xs" />
                   </button>
                   <span class="text-xs font-bold w-6 text-center">{{ fontSize }}</span>
                   <button @click="fontSize = Math.min(20, fontSize + 1)" class="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors">
                     <UIcon name="i-lucide-plus" class="text-xs" />
                   </button>
                </div>
              </div>

              <!-- Show Timestamps -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
                    <UIcon name="i-lucide-clock" class="text-neutral-500" />
                  </div>
                  <div>
                    <p class="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200">Show Timestamps</p>
                    <p class="text-[11px] text-neutral-500">On every message</p>
                  </div>
                </div>
                <USwitch v-model="showTimestamps" />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <UButton
            label="Save Changes"
            color="primary"
            size="md"
            class="px-8 font-bold rounded-xl shadow-lg shadow-primary-500/20"
            @click="isOpen = false"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>({ default: false });
const colorMode = useColorMode();

const isCompact = useState("sidebarCompact", () => false);
const fontSize = useState("chatFontSize", () => 15);
const showTimestamps = useState("showTimestamps", () => true);

const themeOptions = [
  { value: "light", label: "Light", icon: "i-lucide-sun" },
  { value: "dark", label: "Dark", icon: "i-lucide-moon" },
  { value: "system", label: "System", icon: "i-lucide-monitor" },
];

const accentColors = [
  { name: "green", class: "bg-emerald-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "violet", class: "bg-violet-500" },
  { name: "rose", class: "bg-rose-500" },
  { name: "orange", class: "bg-orange-500" },
  { name: "cyan", class: "bg-cyan-500" },
];

const selectedAccent = useState("accentColor", () => "green");

function setAccentColor(color: string) {
  selectedAccent.value = color;
}
</script>
