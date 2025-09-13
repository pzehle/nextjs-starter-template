/**
 * This file serves as the central point for aggregating all translation files.
 * It is used by backend services (e.g., for sending emails) and other parts of the
 * application that are not directly handled by the `next-intl` middleware
 * for frontend rendering. This allows us to have a single source of truth for
 * all translations, whether they are used on the client or server.
 */
import type { SupportedLocale } from '@/lib/i18n-constants';

import de from '../../translations/de.json';
import en from '../../translations/en.json';
import es from '../../translations/es.json';
import fr from '../../translations/fr.json';
import it from '../../translations/it.json';
import nl from '../../translations/nl.json';
import ru from '../../translations/ru.json';
import tr from '../../translations/tr.json';

export const translations = { de, en, es, fr, it, nl, ru, tr };

export type Locale = SupportedLocale;
