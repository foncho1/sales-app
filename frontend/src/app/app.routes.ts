import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  {
    path: 'login',

    loadComponent: () =>
      import('./auth/login/login')
        .then(
          (component) =>
            component.Login
        )
  },


  {
    path: '',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./layout/layout')
        .then(
          (component) =>
            component.Layout
        ),

    children: [

      {
        path: 'products',

        loadComponent: () =>
          import('./products/products')
            .then(
              (component) =>
                component.Products
            )
      },


      {
        path: 'admin/products',

        canActivate: [
          roleGuard(['ADMIN'])
        ],

        data: {
          manage: true
        },

        loadComponent: () =>
          import('./products/products')
            .then(
              (component) =>
                component.Products
            )
      },


      {
        path: 'products/new',

        canActivate: [
          roleGuard(['ADMIN'])
        ],

        loadComponent: () =>
          import('./products/product-form/product-form')
            .then(
              (component) =>
                component.ProductForm
            )
      },


      {
        path: 'products/:id/edit',

        canActivate: [
          roleGuard(['ADMIN'])
        ],

        loadComponent: () =>
          import('./products/product-form/product-form')
            .then(
              (component) =>
                component.ProductForm
            )
      },


      {
        path: 'orders',

        loadComponent: () =>
          import('./orders/orders')
            .then(
              (component) =>
                component.Orders
            )
      },


      {
        path: 'cart',

        loadComponent: () =>
          import('./cart/cart')
            .then(
              (component) =>
                component.Cart
            )
      },


      {
        path: 'admin/categories',

        canActivate: [
          roleGuard(['ADMIN'])
        ],

        loadComponent: () =>
          import('./categories/categories')
            .then(
              (component) =>
                component.Categories
            )
      },


      {
        path: 'admin/users',

        canActivate: [
          roleGuard(['ADMIN'])
        ],

        loadComponent: () =>
          import('./users/users')
            .then(
              (component) =>
                component.Users
            )
      },


      {
        path: 'admin/users/new',

        canActivate: [
          roleGuard(['ADMIN'])
        ],

        loadComponent: () =>
          import('./users/register-user/register-user')
            .then(
              (component) =>
                component.RegisterUser
            )
      },


      {
        path: '',

        redirectTo: 'products',

        pathMatch: 'full'
      }

    ]
  },


  {
    path: 'forbidden',

    loadComponent: () =>
      import('./forbidden/forbidden')
        .then(
          (component) =>
            component.Forbidden
        )
  },

  {
    path: '**',

    redirectTo: ''
  }

];