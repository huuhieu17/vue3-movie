export async function loadLayoutMiddleware(route: any) {
  try {
      let layout = route.meta.layout
      let layoutComponent = await import(`@/layouts/${layout}.vue`)
      route.meta.layoutComponent = layoutComponent.default
  } catch (e) {
      console.error('Error occurred in processing of layouts: ', e)
      console.log('Mounted default layout AppLayoutDefault')
      let layout = 'GuestLayout'
      let layoutComponent = await import(`@/layouts/${layout}.vue`)
      route.meta.layoutComponent = layoutComponent.default
  }
}
