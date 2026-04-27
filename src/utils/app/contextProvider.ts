/**
 * This file contains the context providers for the event and ad details.
 * They are used to prvide the details of the event and ad to the components in pecificEvent.tsx and specificAd.tsx
 */
import { createContext } from 'react'

export const EventContext = createContext<GetEventProps | null>(null)
export const AdContext = createContext<GetJobProps | null>(null)
