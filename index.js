const plugin = require('tailwindcss/plugin');
const _ = require('lodash');

const defaultOptions = {
  ellipsis: true,
  hyphens: true,
  textUnset: true,
  componentPrefix: 'c-',
};

const camelCaseToKebabCase = function(string) {
  return string
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
    .toLowerCase();
};

module.exports = plugin.withOptions(function(options = {}) {
  return function({ theme, variants, e, addUtilities, addComponents }) {
    options = _.defaults({}, options, defaultOptions);

    const textIndentUtilities = _.fromPairs(
      _.map(theme('textIndent'), (value, modifier) => {
        return [
          `.${e(`indent-${modifier}`)}`,
          {
            textIndent: value,
          },
        ];
      })
    );

    const textShadowUtilities = _.fromPairs(
      _.map(theme('textShadow'), (value, modifier) => {
        return [
          `.${e(`text-shadow${modifier === 'default' ? '' : `-${modifier}`}`)}`,
          {
            textShadow: value,
          },
        ];
      })
    );

    const ellipsisUtilities = options.ellipsis ? {
      '.ellipsis': {
        textOverflow: 'ellipsis',
      },
      '.no-ellipsis': {
        textOverflow: 'clip',
      },
    } : {};

    const hyphensUtilities = options.hyphens ? {
      '.hyphens-none': {
        hyphens: 'none',
      },
      '.hyphens-manual': {
        hyphens: 'manual',
      },
      '.hyphens-auto': {
        hyphens: 'auto',
      },
    } : {};

    const textUnsetUtilities = options.textUnset ? {
      '.font-family-unset': {
        fontFamily: 'inherit',
      },
      '.font-weight-unset': {
        fontWeight: 'inherit',
      },
      '.font-style-unset': {
        fontStyle: 'inherit',
      },
      '.text-size-unset': {
        fontSize: 'inherit',
      },
      '.text-align-unset': {
        textAlign: 'inherit',
      },
      '.leading-unset': {
        lineHeight: 'inherit',
      },
      '.tracking-unset': {
        letterSpacing: 'inherit',
      },
      '.text-color-unset': {
        color: 'inherit',
      },
      '.text-transform-unset': {
        textTransform: 'inherit',
      },
    } : {};

    const fontVariantCapsUtilities = _.fromPairs(
      _.map(theme('fontVariantCaps'), (value, modifier) => {
        return [
          `.${e(`caps-${modifier}`)}`,
          {
            fontVariantCaps: value,
          },
        ];
      })
    );

    const fontVariantNumericUtilities = _.fromPairs(
      _.map(theme('fontVariantNumeric'), (value, modifier) => {
        return [
          `.${e(`nums-${modifier}`)}`,
          {
            fontVariantNumeric: value,
          },
        ];
      })
    );

    const fontVariantLigaturesUtilities = _.fromPairs(
      _.map(theme('fontVariantLigatures'), (value, modifier) => {
        return [
          `.${e(`ligatures-${modifier}`)}`,
          {
            fontVariantLigatures: value,
          },
        ];
      })
    );

    const textStylesTheme = theme('textStyles');

    const resolveTextStyle = function(styles) {
      if (!_.isPlainObject(styles)) {
        return _.isArray(styles) ? styles.join(', ') : styles;
      }
      return _.transform(styles, function(result, value, key) {
        if (key === 'extends') {
          _.forEach(_.castArray(value), function(textStyleToExtend) {
            _.forEach(resolveTextStyle(textStylesTheme[textStyleToExtend]), function(extendedValue, extendedKey) {
              if (extendedKey === 'output') {
                return; // continue
              }
              result[extendedKey] = resolveTextStyle(extendedValue);
            });
          });
          return;
        }
        result[key] = resolveTextStyle(value);
      });
    };

    const textStyles = _.fromPairs(
      _.map(textStylesTheme, (componentStyles, componentName) => {
        componentStyles = resolveTextStyle(componentStyles);
        if (componentStyles.output === false) {
          return [];
        }
        return [
          `.${e(`${options.componentPrefix}${camelCaseToKebabCase(componentName)}`)}`,
          componentStyles,
        ];
      })
    );

    addUtilities(textIndentUtilities, variants('textIndent'));
    addUtilities(textShadowUtilities, variants('textShadow'));
    addUtilities(ellipsisUtilities, variants('ellipsis'));
    addUtilities(hyphensUtilities, variants('hyphens'));
    addUtilities(textUnsetUtilities, variants('textUnset'));
    addUtilities(fontVariantCapsUtilities, variants('fontVariantCaps'));
    addUtilities(fontVariantNumericUtilities, variants('fontVariantNumeric'));
    addUtilities(fontVariantLigaturesUtilities, variants('fontVariantLigatures'));
    addComponents(textStyles);
  };
}, function(options = {}) {
  options = _.defaults({}, options, defaultOptions);

  return {
    theme: {
      textIndent: {},
      textShadow: {},
      fontVariantCaps: {
        'normal': 'normal',
        'small': 'small-caps',
        'all-small': 'all-small-caps',
        'petite': 'petite-caps',
        'unicase': 'unicase',
        'titling': 'titling-caps',
      },
      fontVariantNumeric: {
        'normal': 'normal',
        'ordinal': 'ordinal',
        'slashed-zero': 'slashed-zero',
        'lining': 'lining-nums',
        'oldstyle': 'oldstyle-nums',
        'proportional': 'proportional-nums',
        'tabular': 'tabular-nums',
        'diagonal-fractions': 'diagonal-fractions',
        'stacked-fractions': 'stacked-fractions',
      },
      fontVariantLigatures: {
        'normal': 'normal',
        'none': 'none',
        'common': 'common-ligatures',
        'no-common': 'no-common-ligatures',
        'discretionary': 'discretionary-ligatures',
        'no-discretionary': 'no-discretionary-ligatures',
        'historical': 'historical-ligatures',
        'no-historical': 'no-historical-ligatures',
        'contextual': 'contextual',
        'no-contextual': 'no-contextual',
      },
      textStyles: {},
    },
    variants: {
      textIndent: ['responsive'],
      textShadow: ['responsive'],
      ellipsis: ['responsive'],
      hyphens: ['responsive'],
      textUnset: ['responsive'],
      fontVariantCaps: ['responsive'],
      fontVariantNumeric: ['responsive'],
      fontVariantLigatures: ['responsive'],
    },
  };
});